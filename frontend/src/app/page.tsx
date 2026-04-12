import Link from 'next/link';
import {
  Eye, Shield, Award, Users, CalendarCheck, Activity,
  Stethoscope, Microscope, HeartPulse, AlertCircle,
  MapPin, Phone, Mail, Clock, ChevronRight, Star,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import EyeIllustration from '@/components/EyeIllustration';
import styles from './page.module.css';

/* ─── Datos ─────────────────────────────────────────────── */

const STATS = [
  { value: '+2,500', label: 'Pacientes Atendidos', icon: Users },
  { value: '+15',    label: 'Años de Experiencia',  icon: Award },
  { value: '8',      label: 'Especialistas',         icon: Stethoscope },
  { value: '98%',    label: 'Satisfacción',          icon: Star },
];

const SERVICIOS = [
  {
    icon: Eye,
    title: 'Consulta Oftalmológica',
    desc: 'Evaluación integral de la salud visual con equipos de diagnóstico de última generación.',
  },
  {
    icon: Activity,
    title: 'Cirugía Ocular',
    desc: 'Procedimientos quirúrgicos oculares con tecnología láser y microcirugía avanzada.',
  },
  {
    icon: Microscope,
    title: 'Exámenes Diagnósticos',
    desc: 'Tomografía, campo visual, retinografía y exámenes especializados de alta precisión.',
  },
  {
    icon: HeartPulse,
    title: 'Seguimiento Postoperatorio',
    desc: 'Monitoreo continuo y cuidados especializados tras cada intervención quirúrgica.',
  },
  {
    icon: Shield,
    title: 'Tratamientos Especializados',
    desc: 'Terapias para glaucoma, degeneración macular, retina y córnea con protocolos certificados.',
  },
  {
    icon: AlertCircle,
    title: 'Urgencias Oftalmológicas',
    desc: 'Atención inmediata para traumatismos oculares, infecciones y pérdidas súbitas de visión.',
  },
];

const ESPECIALISTAS = [
  {
    nombre: 'Dr. Carlos Ramírez',
    especialidad: 'Cirugía Refractiva',
    experiencia: '12 años de experiencia',
    iniciales: 'CR',
    color: '#7C3AED',
  },
  {
    nombre: 'Dra. María González',
    especialidad: 'Retina y Vítreo',
    experiencia: '9 años de experiencia',
    iniciales: 'MG',
    color: '#6D28D9',
  },
  {
    nombre: 'Dr. Luis Mendoza',
    especialidad: 'Glaucoma y Córnea',
    experiencia: '14 años de experiencia',
    iniciales: 'LM',
    color: '#5B21B6',
  },
];

/* ─── Página ─────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ── HERO ── */}
        <section id="inicio" className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.heroBadge}>
                <Eye size={15} strokeWidth={2.5} />
                <span>Clínica Oftalmológica de Excelencia</span>
              </div>
              <h1 className={styles.heroTitle}>
                Tu Visión,<br />
                <span className={styles.heroTitleAccent}>Nuestro Compromiso</span>
              </h1>
              <p className={styles.heroDesc}>
                En la Clínica de Ojos Norte brindamos atención oftalmológica especializada
                con tecnología de vanguardia y un equipo médico altamente certificado,
                comprometido con tu salud visual.
              </p>
              <div className={styles.heroCTAs}>
                <a href="#servicios" className={styles.ctaPrimary}>
                  Nuestros Servicios
                  <ChevronRight size={18} />
                </a>
                <a href="#nosotros" className={styles.ctaSecondary}>
                  Conocer más
                </a>
              </div>
            </div>
            <div className={styles.heroIllustration}>
              <EyeIllustration />
            </div>
          </div>
          <div className={styles.heroWave}>
            <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,40 C360,90 1080,0 1440,50 L1440,90 L0,90 Z" fill="#FAFAFA" />
            </svg>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Icon size={22} strokeWidth={2} />
                </div>
                <p className={styles.statValue}>{value}</p>
                <p className={styles.statLabel}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SOBRE NOSOTROS ── */}
        <section id="nosotros" className={styles.aboutSection}>
          <div className={styles.container}>
            <div className={styles.aboutGrid}>
              <div className={styles.aboutText}>
                <span className={styles.sectionTag}>Sobre Nosotros</span>
                <h2 className={styles.sectionTitle}>
                  Más de 15 años cuidando<br />la salud visual de Nicaragua
                </h2>
                <p className={styles.aboutPara}>
                  La Clínica de Ojos Norte nació con la misión de democratizar el acceso
                  a la atención oftalmológica de calidad. Somos un centro especializado
                  en el diagnóstico, tratamiento y seguimiento de enfermedades oculares.
                </p>
                <p className={styles.aboutPara}>
                  Contamos con equipamiento de última generación y un equipo de
                  especialistas con formación internacional, comprometidos con ofrecer
                  la mejor experiencia a cada paciente.
                </p>
                <div className={styles.aboutValues}>
                  {[
                    { icon: Shield, title: 'Calidad Certificada',  desc: 'Estándares internacionales de atención médica.' },
                    { icon: HeartPulse, title: 'Atención Humana', desc: 'Cada paciente es tratado con calidez y respeto.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className={styles.valueItem}>
                      <div className={styles.valueIcon}><Icon size={18} /></div>
                      <div>
                        <p className={styles.valueTitle}>{title}</p>
                        <p className={styles.valueDesc}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.aboutVisual}>
                <div className={styles.visualBg} />
                <div className={styles.visualCard}>
                  <Eye size={40} strokeWidth={1.5} />
                  <p>Tecnología de Última Generación</p>
                </div>
                <div className={styles.visualOrb1} />
                <div className={styles.visualOrb2} />
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICIOS ── */}
        <section id="servicios" className={styles.serviciosSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Nuestros Servicios</span>
              <h2 className={styles.sectionTitle}>Atención integral para tu visión</h2>
              <p className={styles.sectionSubtitle}>
                Ofrecemos una amplia gama de servicios oftalmológicos especializados
                para cuidar tu salud visual en todas las etapas de tu vida.
              </p>
            </div>
            <div className={styles.serviciosGrid}>
              {SERVICIOS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className={styles.servicioCard}>
                  <div className={styles.servicioIcon}>
                    <Icon size={24} strokeWidth={1.8} />
                  </div>
                  <h3 className={styles.servicioTitle}>{title}</h3>
                  <p className={styles.servicioDesc}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ESPECIALISTAS ── */}
        <section id="especialistas" className={styles.especialistasSection}>
          <div className={styles.especialistasBg} />
          <div className={styles.container} style={{ position: 'relative' }}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTagLight}>Nuestro Equipo</span>
              <h2 className={`${styles.sectionTitle} ${styles.titleLight}`}>
                Especialistas que confían en tu visión
              </h2>
              <p className={`${styles.sectionSubtitle} ${styles.subtitleLight}`}>
                Médicos oftalmólogos certificados con formación internacional y
                años de experiencia en el cuidado de la salud visual.
              </p>
            </div>
            <div className={styles.especialistasGrid}>
              {ESPECIALISTAS.map(({ nombre, especialidad, experiencia, iniciales, color }) => (
                <div key={nombre} className={styles.especialistaCard}>
                  <div className={styles.especialistaAvatar} style={{ background: color }}>
                    <span>{iniciales}</span>
                  </div>
                  <h3 className={styles.especialistaNombre}>{nombre}</h3>
                  <p className={styles.especialistaEsp}>{especialidad}</p>
                  <p className={styles.especialistaExp}>{experiencia}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACTO ── */}
        <section id="contacto" className={styles.contactoSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Contacto</span>
              <h2 className={styles.sectionTitle}>¿Cómo llegar a nosotros?</h2>
              <p className={styles.sectionSubtitle}>
                Estamos ubicados en el norte de la ciudad, listos para atenderte.
              </p>
            </div>
            <div className={styles.contactoGrid}>
              <div className={styles.contactoInfo}>
                {[
                  { icon: MapPin,  label: 'Dirección',  value: 'Av. Principal Norte 1234, Managua, Nicaragua' },
                  { icon: Phone,   label: 'Teléfono',   value: '+505 2250-1234' },
                  { icon: Mail,    label: 'Correo',     value: 'contacto@clinicaojnorte.com' },
                  { icon: Clock,   label: 'Horario',    value: 'Lun–Vie: 8:00 AM – 6:00 PM\nSáb: 8:00 AM – 12:00 PM' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className={styles.contactoItem}>
                    <div className={styles.contactoIcon}><Icon size={20} /></div>
                    <div>
                      <p className={styles.contactoLabel}>{label}</p>
                      <p className={styles.contactoValue}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.mapPlaceholder}>
                <div className={styles.mapInner}>
                  <MapPin size={36} strokeWidth={1.5} />
                  <p>Clínica de Ojos Norte</p>
                  <span>Av. Principal Norte 1234</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className={styles.ctaBanner}>
          <div className={styles.container}>
            <div className={styles.ctaBannerContent}>
              <CalendarCheck size={36} strokeWidth={1.5} />
              <div>
                <h2>¿Eres personal de la clínica?</h2>
                <p>Accede al sistema de gestión para administrar citas, pacientes e historiales clínicos.</p>
              </div>
              <Link href="/login" className={styles.ctaBannerBtn}>
                Iniciar Sesión
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <div className={styles.footerLogoIcon}><Eye size={18} strokeWidth={2.5} /></div>
                <span>Clínica de Ojos Norte</span>
              </div>
              <p className={styles.footerTagline}>
                Cuidando tu visión con excelencia y tecnología de vanguardia desde 2009.
              </p>
            </div>
            <div className={styles.footerCol}>
              <h4>Servicios</h4>
              <ul>
                {['Consulta General', 'Cirugía Ocular', 'Exámenes Diagnósticos', 'Urgencias'].map(s => (
                  <li key={s}><a href="#servicios">{s}</a></li>
                ))}
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Clínica</h4>
              <ul>
                {[
                  { label: 'Sobre Nosotros', href: '#nosotros' },
                  { label: 'Especialistas',  href: '#especialistas' },
                  { label: 'Contacto',       href: '#contacto' },
                  { label: 'Acceso al Sistema', href: '/login' },
                ].map(({ label, href }) => (
                  <li key={label}><a href={href}>{label}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} Clínica de Ojos Norte. Todos los derechos reservados.</p>
            <p>Proyecto académico — Uso educativo.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
