import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Clínica de Ojos Norte — Sistema de Gestión',
  description:
    'Sistema de información para la gestión de consultas, citas e historial clínico de la Clínica de Ojos Norte.',
  keywords: ['oftalmología', 'clínica', 'ojos', 'gestión', 'pacientes', 'citas', 'Nicaragua'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
