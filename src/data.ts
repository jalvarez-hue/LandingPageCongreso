export interface Perspective {
  label: string;
  description: string;
  finds: string[];
  contributes: string[];
}

export interface Panel {
  track: string;
  title: string;
  moderator: string;
  panelists: string[];
}

export const perspectives: Perspective[] = [
  { label: 'Hospitales', description: 'Conversa con las aseguradoras y construye relaciones de largo plazo.', finds: ['Diálogo directo con áreas de siniestros y redes médicas.', 'Mejores prácticas en convenios, autorizaciones y tabuladores.', 'Visibilidad ante aseguradoras y médicos.'], contributes: ['La visión operativa del hospital.', 'Casos de éxito y retos reales.'] },
  { label: 'Médicos', description: 'Tu criterio clínico es la pieza que une al hospital con la aseguradora.', finds: ['Red de colegas y especialistas.', 'Claridad en procesos con aseguradoras.', 'Presencia en el directorio de la comunidad.'], contributes: ['Criterio clínico en los temas de la agenda.', 'Propuestas para mejorar la atención.'] },
  { label: 'Aseguradoras', description: 'Construye junto con la red médica y hospitalaria soluciones que funcionen para todos.', finds: ['Lectura directa de hospitales y médicos.', 'Espacios para co-crear soluciones con la red.', 'Tendencias e innovación del sector.'], contributes: ['La visión técnica y financiera del seguro.', 'Apertura para resolver en conjunto.'] },
  { label: 'Proveedores', description: 'Conoce de primera mano lo que la industria necesita resolver.', finds: ['Necesidades reales de hospitales y aseguradoras.', 'Acceso a tomadores de decisión.', 'Espacios para mostrar tu solución.'], contributes: ['Tecnología, servicios e innovación.', 'Conocimiento especializado.'] },
];

export const panels: Panel[] = [
  { track: 'Estrategia', title: '¿Aliados o adversarios? La nueva realidad entre hospitales y aseguradoras', moderator: 'Jesús Hernández · Director General en WeeCompany', panelists: ['Patrick Devlyn Jr. · Health Consultancy en Benedev Group', 'Juan Pablo González Winklmeier · CFO en Plan Seguro', 'Pablo Ricalde · Director General del Consorcio Mexicano de Hospitales'] },
  { track: 'Financiero', title: 'Costo médico al alza: ¿responsabilidad compartida?', moderator: 'César Rojas · CEO en El Asegurador México', panelists: ['Fernando Benavides · CEO en Alivia', 'Rubén Darío Cruz · MAPFRE México', 'Bruno Guarneros · Director Médico en Seguros Atlas'] },
  { track: 'Tecnología', title: 'IA en seguros de salud: ¿revolución real o promesa inflada?', moderator: 'Diego Rodríguez · Director Comercial en WeeCompany', panelists: ['Alejandro Chias Contreras · Asesor Especializado de Seguros', 'Alessandro Labelli · Head of Insurtech en Mercado Pago'] },
];

export const stats = [
  { value: 147, label: 'Voces del sector' },
  { value: 14, label: 'Aseguradoras' },
  { value: 85, label: 'Hospitales' },
  { value: 35, label: 'Patrocinadores' },
];
