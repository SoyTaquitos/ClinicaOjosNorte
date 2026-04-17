"""
apps/users/views.py
Vistas exclusivas del dominio de Usuarios y Autenticación.
Solo el personal interno (Admin, Administrativo, Médico, Especialista) tiene cuenta.
Los pacientes son gestionados como registros — no tienen login.

Roles → apps/roles/views.py
Permisos → apps/permisos/views.py

Auth endpoints:
  POST  /api/v1/auth/login/
  POST  /api/v1/auth/logout/
  GET   /api/v1/auth/me/
  PATCH /api/v1/auth/me/
  POST  /api/v1/auth/change-password/
  POST  /api/v1/auth/reset-password/
  POST  /api/v1/auth/reset-password/verify-code/
  POST  /api/v1/auth/reset-password/confirm/

Users CRUD:
  /api/v1/users/
  /api/v1/users/{id}/activar/
  /api/v1/users/{id}/bloquear/
  GET/POST /api/v1/users/{id}/roles/
"""
import logging

from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.bitacora.models import AccionBitacora
from apps.core.permissions import IsAdmin, IsAdministrativoOrAdmin
from apps.core.utils import get_client_ip, registrar_bitacora

from .emails import enviar_recuperacion_password
from .login_lockout import (
    is_locked,
    lockout_error_payload,
    normalize_login_key,
    record_failure,
    record_success,
)
from .models import ConfiguracionLoginSeguridad, TipoUsuario, Usuario
from .serializers import (
    BAD_CREDENTIALS_MSG,
    CambiarPasswordSerializer,
    ConfirmarPasswordSerializer,
    LoginSeguridadConfigSerializer,
    LoginSerializer,
    PerfilSerializer,
    RecuperarPasswordSerializer,
    VerificarCodigoRecuperacionSerializer,
    UsuarioCreateSerializer,
    UsuarioSerializer,
)
from .tokens import buscar_token_recuperacion_valido, crear_token_recuperacion

logger = logging.getLogger('apps')


def _jwt_response(usuario):
    """Genera respuesta estándar con tokens JWT + datos del usuario."""
    refresh = RefreshToken.for_user(usuario)
    return {
        'usuario': UsuarioSerializer(usuario).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


def _errors_mean_bad_credentials_only(errors):
    """True si el único fallo es credenciales incorrectas (cuenta para bloqueo temporal)."""
    login_err = errors.get('login')
    if not login_err:
        return False
    first = login_err[0] if isinstance(login_err, (list, tuple)) else login_err
    if str(first) != BAD_CREDENTIALS_MSG:
        return False
    return len(errors) == 1


# ---------------------------------------------------------------------------
# Auth Views
# ---------------------------------------------------------------------------


class LoginView(APIView):
    """
    POST /api/v1/auth/login/
    Acepta username o email. Retorna JWT + datos del usuario.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        login_raw = request.data.get('login', '')
        login_key = normalize_login_key(login_raw) if isinstance(login_raw, str) else ''

        locked, retry_sec = is_locked(login_key)
        if locked:
            return Response(
                lockout_error_payload(retry_sec),
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            if _errors_mean_bad_credentials_only(serializer.errors):
                record_failure(login_key)
                locked2, retry2 = is_locked(login_key)
                if locked2:
                    return Response(
                        lockout_error_payload(retry2),
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                    )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        usuario = serializer.validated_data['user']
        record_success(login_key)

        usuario.ultimo_acceso = timezone.now()
        usuario.save(update_fields=['ultimo_acceso'])

        registrar_bitacora(
            usuario=usuario, modulo='auth', accion=AccionBitacora.LOGIN,
            descripcion=f'Login exitoso: {usuario.username}',
            ip_origen=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response(_jwt_response(usuario))


class LoginSeguridadConfigView(APIView):
    """
    GET/PATCH /api/security/login-config/
    Solo ADMIN. Umbrales de bloqueo temporal por intentos fallidos (por clave de login).
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        cfg = ConfiguracionLoginSeguridad.get_solo()
        return Response(LoginSeguridadConfigSerializer(cfg).data)

    def patch(self, request):
        cfg = ConfiguracionLoginSeguridad.get_solo()
        ser = LoginSeguridadConfigSerializer(cfg, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        inst = ser.instance
        registrar_bitacora(
            usuario=request.user,
            modulo='auth',
            accion=AccionBitacora.EDITAR,
            descripcion=(
                f'Config seguridad login: max_intentos={inst.max_intentos_fallidos}, '
                f'minutos_bloqueo={inst.minutos_bloqueo}'
            ),
            tabla_afectada='configuracion_login_seguridad',
            id_registro_afectado=1,
            ip_origen=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response(LoginSeguridadConfigSerializer(inst).data)


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Body: { "refresh": "<refresh_token>" }
    Añade el refresh token a la JWT Blacklist.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Se requiere el refresh token.'}, status=400)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({'error': 'Token inválido o ya expirado.'}, status=400)

        registrar_bitacora(
            usuario=request.user, modulo='auth', accion=AccionBitacora.LOGOUT,
            descripcion=f'Logout: {request.user.username}',
            ip_origen=get_client_ip(request),
        )
        return Response({'mensaje': 'Sesión cerrada correctamente.'})


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/v1/auth/me/  — Ver perfil propio
    PATCH /api/v1/auth/me/  — Editar perfil propio
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PerfilSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        serializer.save()
        registrar_bitacora(
            usuario=self.request.user, modulo='auth', accion=AccionBitacora.EDITAR,
            descripcion=f'Perfil actualizado: {self.request.user.username}',
            tabla_afectada='usuarios', id_registro_afectado=self.request.user.id,
            ip_origen=get_client_ip(self.request),
        )


class ChangePasswordView(APIView):
    """POST /api/v1/auth/change-password/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CambiarPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.check_password(serializer.validated_data['password_actual']):
            return Response({'error': 'La contraseña actual es incorrecta.'}, status=400)

        request.user.set_password(serializer.validated_data['password_nuevo'])
        request.user.save(update_fields=['password'])

        registrar_bitacora(
            usuario=request.user, modulo='auth', accion=AccionBitacora.CAMBIAR_PASSWORD,
            descripcion=f'Cambio de contraseña: {request.user.username}',
            ip_origen=get_client_ip(request),
        )
        return Response({'mensaje': 'Contraseña actualizada correctamente.'})


class ResetPasswordView(APIView):
    """
    POST /api/v1/auth/reset-password/
    Envía email con token de reset. Siempre responde 200 (no revela si el email existe).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RecuperarPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            usuario = Usuario.objects.get(email__iexact=email.strip(), estado='ACTIVO')
            token_obj = crear_token_recuperacion(usuario)
            enviar_recuperacion_password(usuario, token_obj.token)
            registrar_bitacora(
                usuario=usuario, modulo='auth', accion=AccionBitacora.RECUPERAR_PASSWORD,
                descripcion=f'Solicitud reset password: {usuario.email}',
                ip_origen=get_client_ip(request),
            )
        except Usuario.DoesNotExist:
            pass

        return Response({'mensaje': 'Si el correo existe, recibirás instrucciones en breve.'})


class ResetPasswordVerifyCodeView(APIView):
    """
    POST /api/auth/reset-password/verify-code/
    Comprueba email + código sin consumir el código (siguiente paso: confirm con nueva contraseña).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerificarCodigoRecuperacionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        codigo = serializer.validated_data['codigo']

        token_obj, err = buscar_token_recuperacion_valido(email, codigo)
        if err == 'expired':
            return Response(
                {'error': 'El código expiró. Solicita un correo nuevo desde el inicio.'},
                status=400,
            )
        if err == 'invalid' or not token_obj:
            return Response({'error': 'Código incorrecto.'}, status=400)

        return Response({'mensaje': 'Código verificado. Ya puedes definir tu nueva contraseña.'})


class ResetPasswordConfirmView(APIView):
    """POST /api/v1/auth/reset-password/confirm/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ConfirmarPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        codigo = serializer.validated_data['codigo']
        token_obj, err = buscar_token_recuperacion_valido(email, codigo)
        if err == 'expired':
            return Response(
                {'error': 'El código expiró. Solicita un correo nuevo desde el inicio.'},
                status=400,
            )
        if err == 'invalid' or not token_obj:
            return Response({'error': 'Código incorrecto.'}, status=400)

        usuario = token_obj.id_usuario
        usuario.set_password(serializer.validated_data['password_nuevo'])
        usuario.save(update_fields=['password'])
        token_obj.usado = True
        token_obj.save(update_fields=['usado'])

        registrar_bitacora(
            usuario=usuario, modulo='auth', accion=AccionBitacora.CAMBIAR_PASSWORD,
            descripcion=f'Password restablecida via token: {usuario.username}',
            ip_origen=get_client_ip(request),
        )
        return Response({'mensaje': 'Contraseña restablecida correctamente.'})


# ---------------------------------------------------------------------------
# Gestión de Usuarios (Admin/Administrativo)
# ---------------------------------------------------------------------------

class UsuarioViewSet(viewsets.ModelViewSet):
    """
    CRUD completo de usuarios.
    GET/POST    /api/v1/users/
    GET/PUT/PATCH/DELETE /api/v1/users/{id}/
    POST        /api/v1/users/{id}/activar/
    POST        /api/v1/users/{id}/bloquear/
    GET/POST    /api/v1/users/{id}/roles/   (consulta/asigna roles via apps.roles)
    """
    queryset = Usuario.objects.all().order_by('apellidos', 'nombres')
    permission_classes = [IsAuthenticated, IsAdministrativoOrAdmin]

    def get_serializer_class(self):
        return UsuarioCreateSerializer if self.action == 'create' else UsuarioSerializer

    def perform_create(self, serializer):
        usuario = serializer.save()
        registrar_bitacora(
            usuario=self.request.user, modulo='users', accion=AccionBitacora.CREAR,
            descripcion=f'Creó usuario: {usuario.username}',
            tabla_afectada='usuarios', id_registro_afectado=usuario.id,
            ip_origen=get_client_ip(self.request),
        )

    def perform_update(self, serializer):
        usuario = serializer.save()
        registrar_bitacora(
            usuario=self.request.user, modulo='users', accion=AccionBitacora.EDITAR,
            descripcion=f'Editó usuario: {usuario.username}',
            tabla_afectada='usuarios', id_registro_afectado=usuario.id,
            ip_origen=get_client_ip(self.request),
        )

    def perform_destroy(self, instance):
        registrar_bitacora(
            usuario=self.request.user, modulo='users', accion=AccionBitacora.ELIMINAR,
            descripcion=f'Eliminó usuario: {instance.username}',
            tabla_afectada='usuarios', id_registro_afectado=instance.id,
            ip_origen=get_client_ip(self.request),
        )
        instance.delete()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.pk == request.user.pk:
            return Response(
                {'error': 'No puedes eliminar tu propia cuenta.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if (
            instance.tipo_usuario == TipoUsuario.ADMIN
            and request.user.tipo_usuario != TipoUsuario.ADMIN
        ):
            return Response(
                {
                    'error': (
                        'Solo un administrador del sistema puede eliminar cuentas '
                        'de tipo Admin del sistema.'
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """POST /api/v1/users/{id}/activar/"""
        usuario = self.get_object()
        usuario.estado = 'ACTIVO'
        usuario.is_active = True
        usuario.save(update_fields=['estado', 'is_active'])
        registrar_bitacora(
            usuario=request.user, modulo='users', accion=AccionBitacora.EDITAR,
            descripcion=f'Activó usuario: {usuario.username}',
            tabla_afectada='usuarios', id_registro_afectado=usuario.id,
            ip_origen=get_client_ip(request),
        )
        return Response({'mensaje': f'Usuario {usuario.username} activado.'})

    @action(detail=True, methods=['post'])
    def bloquear(self, request, pk=None):
        """POST /api/v1/users/{id}/bloquear/"""
        usuario = self.get_object()
        if usuario.pk == request.user.pk:
            return Response(
                {'error': 'No puedes bloquear tu propia cuenta.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        usuario.estado = 'BLOQUEADO'
        usuario.is_active = False
        usuario.save(update_fields=['estado', 'is_active'])
        registrar_bitacora(
            usuario=request.user, modulo='users', accion=AccionBitacora.EDITAR,
            descripcion=f'Bloqueó usuario: {usuario.username}',
            tabla_afectada='usuarios', id_registro_afectado=usuario.id,
            ip_origen=get_client_ip(request),
        )
        return Response({'mensaje': f'Usuario {usuario.username} bloqueado.'})

    @action(detail=True, methods=['get', 'post'], url_path='roles')
    def roles(self, request, pk=None):
        """
        GET  /api/v1/users/{id}/roles/ — Roles asignados al usuario
        POST /api/v1/users/{id}/roles/ — Asignar rol al usuario
        Body: { "id_rol": <id> }
        """
        from apps.roles.models import UsuarioRol
        from apps.roles.serializers import UsuarioRolSerializer

        usuario = self.get_object()
        if request.method == 'GET':
            asignaciones = UsuarioRol.objects.filter(
                id_usuario=usuario
            ).select_related('id_rol')
            return Response(UsuarioRolSerializer(asignaciones, many=True).data)

        data = {**request.data, 'id_usuario': usuario.pk}
        serializer = UsuarioRolSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        ur = serializer.save()
        rol_nombre = ur.id_rol.nombre
        registrar_bitacora(
            usuario=request.user, modulo='users', accion=AccionBitacora.CREAR,
            descripcion=f'Asignó rol "{rol_nombre}" a usuario {usuario.username}',
            tabla_afectada='usuario_rol', id_registro_afectado=ur.pk,
            ip_origen=get_client_ip(request),
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
