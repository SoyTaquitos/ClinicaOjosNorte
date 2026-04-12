'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, Lock, Mail, EyeOff, ChevronLeft, Shield, Activity, LayoutDashboard } from 'lucide-react';
import EyeIllustration from '@/components/EyeIllustration';
import styles from './page.module.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [remember,     setRemember]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    /* Simulación de autenticación (reemplazar con llamada real al backend) */
    await new Promise(r => setTimeout(r, 1400));

    if (email === 'admin@clinica.com' && password === 'admin123') {
      window.location.href = '/dashboard';
    } else {
      setLoading(false);
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Panel izquierdo ── */}
      <div className={styles.leftPanel}>
        {/* Partículas decorativas */}
        <div className={styles.particles} aria-hidden>
          {[
            { w:10, h:10, top:'12%', left:'15%', dur:'7s',   delay:'0s'   },
            { w:6,  h:6,  top:'25%', left:'75%', dur:'9s',   delay:'1.5s' },
            { w:14, h:14, top:'65%', left:'18%', dur:'8s',   delay:'0.8s' },
            { w:8,  h:8,  top:'78%', left:'70%', dur:'6s',   delay:'2s'   },
            { w:5,  h:5,  top:'45%', left:'88%', dur:'10s',  delay:'0.4s' },
            { w:12, h:12, top:'88%', left:'40%', dur:'7.5s', delay:'1.2s' },
          ].map(({ w, h, top, left, dur, delay }, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{
                width: w, height: h,
                top, left,
                ['--dur' as string]: dur,
                ['--delay' as string]: delay,
              }}
            />
          ))}
        </div>

        <div className={styles.leftContent}>
          <div className={styles.illustration}>
            <EyeIllustration />
          </div>

          <p className={styles.brandName}>Clínica de Ojos Norte</p>
          <p className={styles.brandTagline}>Sistema de Gestión Oftalmológica</p>

          <ul className={styles.featureList}>
            {[
              { icon: Shield,         text: 'Acceso seguro y controlado'       },
              { icon: LayoutDashboard, text: 'Gestión integral de la clínica'  },
              { icon: Activity,        text: 'Historial clínico en tiempo real' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className={styles.featureItem}>
                <span className={styles.featureIcon}><Icon size={14} strokeWidth={2} /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Panel derecho (formulario) ── */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>

          {/* Logo pequeño (solo en mobile) */}
          <div className={styles.mobileHeader}>
            <div className={styles.mobileLogoRow}>
              <div className={styles.mobileLogoIcon}><Eye size={16} strokeWidth={2.5} /></div>
              <span className={styles.mobileBrandName}>Clínica de Ojos Norte</span>
            </div>
            <span className={styles.mobileBrandSub}>Sistema de Gestión</span>
          </div>

          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Iniciar Sesión</h1>
            <p className={styles.cardSubtitle}>
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {error && (
              <div className={styles.errorBanner} role="alert">
                <Lock size={15} />
                {error}
              </div>
            )}

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">
                Correo Electrónico
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><Mail size={16} /></span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="correo@clinica.com"
                  className={styles.input}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="password">
                Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><Lock size={16} /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={styles.input}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.togglePwd}
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Opciones */}
            <div className={styles.formOptions}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  disabled={loading}
                />
                Recordarme
              </label>
              <a href="#" className={styles.forgotLink}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Verificando…
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className={styles.cardFooter}>
            <Link href="/" className={styles.backLink}>
              <ChevronLeft size={15} />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
