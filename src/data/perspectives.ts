import type { Perspective, SponsorshipLevel } from '../types/congress';

export const perspectives = [
  {
    id: 'hospitales',
    label: 'Hospitales',
    description: 'Conversa con las aseguradoras y construye relaciones de largo plazo.',
    find: [
      'Diálogo directo con áreas de siniestros y redes médicas.',
      'Mejores prácticas en convenios, autorizaciones y tabuladores.',
      'Visibilidad ante aseguradoras y médicos.',
    ],
    contribute: ['La visión operativa del hospital.', 'Casos de éxito y retos reales.'],
  },
  {
    id: 'medicos',
    label: 'Médicos',
    description: 'Tu criterio clínico es la pieza que une al hospital con la aseguradora.',
    find: [
      'Red de colegas y especialistas.',
      'Claridad en procesos con aseguradoras.',
      'Presencia en el directorio de la comunidad.',
    ],
    contribute: [
      'Criterio clínico en los temas de la agenda.',
      'Propuestas para mejorar la atención.',
    ],
  },
  {
    id: 'aseguradoras',
    label: 'Aseguradoras',
    description: 'Construye junto con la red médica y hospitalaria soluciones que funcionen para todos.',
    find: [
      'Lectura directa de hospitales y médicos.',
      'Espacios para co-crear soluciones con la red.',
      'Tendencias e innovación del sector.',
    ],
    contribute: ['La visión técnica y financiera del seguro.', 'Apertura para resolver en conjunto.'],
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    description: 'Conoce de primera mano lo que la industria necesita resolver.',
    find: [
      'Necesidades reales de hospitales y aseguradoras.',
      'Acceso a tomadores de decisión.',
      'Espacios para mostrar tu solución, incluido el congreso.',
    ],
    contribute: ['Tecnología, servicios e innovación.', 'Conocimiento especializado.'],
  },
] as const satisfies readonly Perspective[];

export const sponsorshipLevels = [
  {
    id: 'Diamante',
    description:
      'La máxima exposición: tu marca en el escenario principal y presente en cada momento del congreso.',
  },
  {
    id: 'Oro',
    description:
      'Visibilidad destacada frente a directivos de aseguradoras, hospitales y proveedores de salud.',
  },
  {
    id: 'Plata',
    description:
      'Conecta tu marca con los tomadores de decisión que definen el futuro del sector.',
  },
  {
    id: 'Branding',
    description:
      'Tu marca en manos de cada asistente: arco, kit, cordones y experiencias memorables.',
  },
] as const satisfies readonly { id: SponsorshipLevel; description: string }[];
