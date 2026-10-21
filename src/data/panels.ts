import type { CongressPanel, EditionId } from '../types/congress';

export const panelsByEdition: Record<Exclude<EditionId, 'prox'>, readonly CongressPanel[]> = {
  "mer": [
    {
      "id": "relaci-n-1",
      "track": "Relación",
      "title": "Experiencia, eficiencia y confianza: claves en la relación hospital–aseguradora",
      "moderator": {
        "name": "Jesús Hernández",
        "role": "CEO en WeeCompany · Presidente de HealthTech México"
      },
      "panelists": [
        {
          "name": "Juan Ignacio Gil Antón",
          "role": "Consultor independiente"
        },
        {
          "name": "Juan José Plata Muñoz",
          "role": "Director Nacional Médico en AXA Seguros"
        },
        {
          "name": "Roberto Bonilla de la Garza",
          "role": "Director General Corporativo en Grupo Dalinde San Ángel Inn"
        },
        {
          "name": "Pablo Ricalde",
          "role": "Director General del Consorcio Mexicano de Hospitales (CMH)"
        }
      ]
    },
    {
      "id": "-tica-2",
      "track": "Ética",
      "title": "Triángulo ético: entre el cliente, la aseguradora y los agentes",
      "moderator": {
        "name": "Laura Edith Islas",
        "role": "Directora General en Revista Siniestro"
      },
      "panelists": [
        {
          "name": "Elisa Cibrián",
          "role": "Subdirección de Siniestros Beneficios en Interprotección"
        },
        {
          "name": "Jonathan Cuevas",
          "role": "Director de Transformación y Siniestros en Lockton"
        },
        {
          "name": "Guillermo Barraza Amaya",
          "role": "Director de Oferta de Valor en SEKURA"
        },
        {
          "name": "Diego Gómez Palacio Borboa",
          "role": "Director de Expansión, M&A y Legal en Bupa México"
        }
      ]
    },
    {
      "id": "costos-3",
      "track": "Costos",
      "title": "Mitos y realidades sobre el costo médico: hospitales, aseguradoras y actuarios debaten las causas y consecuencias del alza",
      "moderator": {
        "name": "Lucyana Díaz Martínez",
        "role": "Subdirección de Redes Médicas y Hogar en AXA Assistance"
      },
      "panelists": [
        {
          "name": "José Antonio Pérez Estrada",
          "role": "Director Comercial y de Negocios en Hospitales Star Médica"
        },
        {
          "name": "Jessica Garnier",
          "role": "Directora Comercial de Hospitales y Farmacias en Hispano Americano"
        },
        {
          "name": "Bruno Guarneros",
          "role": "Director Médico en Seguros Atlas"
        },
        {
          "name": "Avril Rey Taboada",
          "role": "Directora del Sistema Integrado de Salud en AXA Keralty Centauro"
        }
      ]
    },
    {
      "id": "tecnolog-a-4",
      "track": "Tecnología",
      "title": "Nuevas tecnologías médicas de alto costo y su impacto en las primas y la siniestralidad",
      "moderator": {
        "name": "Alexandro Arias García",
        "role": "Socio Comercial y de Innovación en Salud en Deloitte"
      },
      "panelists": [
        {
          "name": "Mabel Marrón",
          "role": "Subdirectora Función Actuarial en Ve por Más"
        },
        {
          "name": "Jesús Spínola",
          "role": "CEO en RGA Latinoamérica"
        },
        {
          "name": "Patrick Devlyn",
          "role": "Consejero Delegado en BENEDEV"
        },
        {
          "name": "Lorena Cruz Vega",
          "role": "Dirección Ejecutiva de la línea de negocio Salud, Vida y AP en General de Salud"
        },
        {
          "name": "Elizabeth Flores García",
          "role": "Directora Médica y de Siniestros en Plan Seguro"
        }
      ]
    },
    {
      "id": "operaci-n-5",
      "track": "Operación",
      "title": "Mapa de fricciones en la operación diaria: equipos mixtos hospital–aseguradora identifican obstáculos y duplicidades",
      "moderator": {
        "name": "Sergio Ahumada",
        "role": "Presidente del Colegio Mexicano de Auditoría Médica y Gestión en Servicios de Salud"
      },
      "panelists": [
        {
          "name": "Josué Sarmiento",
          "role": "Director de Convenios Corporativos en Hospitales MAC"
        },
        {
          "name": "Ernesto González",
          "role": "Gerente de Convenios en Quálitas Salud"
        },
        {
          "name": "Fabiola Ramírez Woo",
          "role": "Dirección General en Christus Muguerza"
        },
        {
          "name": "Mario Vela Berrondo",
          "role": "Director General en La Latino Seguros"
        }
      ]
    },
    {
      "id": "colaboraci-n-6",
      "track": "Colaboración",
      "title": "Modelos de colaboración exitosos entre aseguradoras y hospitales",
      "moderator": {
        "name": "Jorge Carreño García",
        "role": "Director de Redes y Calidad Médica en WeeMedic"
      },
      "panelists": [
        {
          "name": "Manuel Hernández Ávila",
          "role": "Director Comercial en Seguros Ve por Más"
        },
        {
          "name": "Mayela Rodríguez Cantú",
          "role": "COO, Directora Ejecutiva de Operaciones en Zurich Santander"
        },
        {
          "name": "Juan José Plata Muñoz",
          "role": "Director Nacional Médico en AXA Seguros"
        },
        {
          "name": "Patricio González Abarca",
          "role": "Director General en Hospitaria"
        },
        {
          "name": "Beatriz Romero Guajardo",
          "role": "Directora General en Hospital Medyca Bosques"
        }
      ]
    },
    {
      "id": "codificaci-n-7",
      "track": "Codificación",
      "title": "Un aliado necesario: codificación para servicios y procedimientos",
      "moderator": {
        "name": "Nora Lara",
        "role": "Directora General en WeeMedic"
      },
      "panelists": [
        {
          "name": "Víctor Medina",
          "role": "Terminólogo senior y representante para LATAM en SNOMED International"
        },
        {
          "name": "Alejandra López Mendoza",
          "role": "Directora de Pricing, Líneas Comerciales de Vida y Salud en AXA Seguros"
        },
        {
          "name": "Lizette Soldan Uribe",
          "role": "Líder de Proyectos Estratégicos en Seguros Sura México"
        },
        {
          "name": "Andrés Sánchez Campos",
          "role": "Director Case Management & Networks LATAM en Global Excel"
        }
      ]
    },
    {
      "id": "experiencia-8",
      "track": "Experiencia",
      "title": "La experiencia del asegurado: casos de éxito",
      "moderator": {
        "name": "Oscar González Legorreta",
        "role": "Managing Partner en InSureMate"
      },
      "panelists": [
        {
          "name": "Enrique Isaac Pérez",
          "role": "Gerente de Case Management en WeeMedic"
        },
        {
          "name": "Carla Ruíz Robles",
          "role": "Medical Network Lead en Sofia Salud"
        },
        {
          "name": "Jean-Louis Brunet Torres",
          "role": "Founder & CEO en Mutuus"
        },
        {
          "name": "Ayari Green",
          "role": "Directora de Mercadotecnia y Experiencia en Plan Seguro"
        }
      ]
    }
  ],
  "mty": [
    {
      "id": "estrategia-1",
      "track": "Estrategia",
      "title": "¿Aliados o adversarios? La nueva realidad entre hospitales y aseguradoras",
      "moderator": {
        "name": "Jesús Hernández",
        "role": "Director General en WeeCompany"
      },
      "panelists": [
        {
          "name": "Patrick Devlyn Jr.",
          "role": "Health Consultancy en Benedev Group"
        },
        {
          "name": "Juan Pablo González Winklmeier",
          "role": "CFO en Plan Seguro"
        },
        {
          "name": "Pablo Ricalde",
          "role": "Director General del Consorcio Mexicano de Hospitales"
        },
        {
          "name": "Felipe Arturo Vila Maldonado",
          "role": "Insurance Product and Business Intelligence Head en Coppel"
        }
      ]
    },
    {
      "id": "financiero-2",
      "track": "Financiero",
      "title": "Costo médico al alza: ¿responsabilidad compartida?",
      "moderator": {
        "name": "César Rojas",
        "role": "CEO en El Asegurador México"
      },
      "panelists": [
        {
          "name": "Fernando Benavides",
          "role": "CEO en Alivia"
        },
        {
          "name": "Rubén Darío Cruz",
          "role": "Subdirector de Proveedores Personas en MAPFRE México"
        },
        {
          "name": "Roberto García",
          "role": "Director de Expansión y Desarrollo en AUNA"
        },
        {
          "name": "Bruno Guarneros",
          "role": "Director Médico en Seguros Atlas"
        }
      ]
    },
    {
      "id": "operativo-3",
      "track": "Operativo",
      "title": "¿Ha muerto el modelo de pago por uso? ¿Estamos listos para el pago basado en valor?",
      "moderator": {
        "name": "Nora Lara",
        "role": "Directora General en WeeMedic"
      },
      "panelists": [
        {
          "name": "Maritsa Paz Olivares",
          "role": "Subdirectora de Productos y Servicios en Centro Médico ABC"
        },
        {
          "name": "Daniel McKee García",
          "role": "Director Corporativo Comercial en Hospitaria"
        },
        {
          "name": "Rafael Castro",
          "role": "Dirección General en Centro Oncológico Internacional"
        },
        {
          "name": "Avril Rey Taboada",
          "role": "Subdirectora del Sistema Integral de Salud en AXA Keralty"
        }
      ]
    },
    {
      "id": "tecnolog-a-4",
      "track": "Tecnología",
      "title": "IA en seguros de salud: ¿revolución real o promesa inflada? Casos de uso reales",
      "moderator": {
        "name": "Diego Rodríguez",
        "role": "Director Comercial en WeeCompany"
      },
      "panelists": [
        {
          "name": "Alejandro Chias Contreras",
          "role": "Asesor Especializado de Seguros"
        },
        {
          "name": "Alessandro Labelli",
          "role": "Head of Insurtech en Mercado Pago"
        },
        {
          "name": "Guillermo Barraza Amaya",
          "role": "Head of Insurance en Broxel"
        },
        {
          "name": "Sergio Mendoza",
          "role": "Director General Adjunto en Swiss Hospital"
        },
        {
          "name": "Jesús Spinola",
          "role": "CEO Latin America en RGA"
        }
      ]
    },
    {
      "id": "experiencia-5",
      "track": "Experiencia",
      "title": "¿Es la interoperabilidad el eslabón perdido entre hospitales y aseguradoras?",
      "moderator": {
        "name": "Angélica de León",
        "role": "Gerente Comercial en WeeCompany"
      },
      "panelists": [
        {
          "name": "Jessica Garnier",
          "role": "Presidenta Ejecutiva de Hospitales Hispano Americano"
        },
        {
          "name": "Carlos Eusebio Montemayor Hernández",
          "role": "Director General, Hospital CHRISTUS MUGUERZA Cumbres"
        },
        {
          "name": "Rodrigo Díaz Gutiérrez",
          "role": "Subdirector de Socios de Salud en SMNYL"
        },
        {
          "name": "Carlos Gama",
          "role": "Director Comercial Corporativo en Hospitales Puerta de Hierro"
        }
      ]
    },
    {
      "id": "producto-6",
      "track": "Producto",
      "title": "¿Hacia dónde debe evolucionar el GMM en México?",
      "moderator": {
        "name": "Laura Edith Islas Yáñez",
        "role": "Directora General en Revista Siniestro"
      },
      "panelists": [
        {
          "name": "Alejandro Pérez Galindo",
          "role": "Director General en Quálitas Salud"
        },
        {
          "name": "Lorena Cruz",
          "role": "Business Development Director, Health en RGA"
        },
        {
          "name": "Héctor Fernández Sánchez",
          "role": "Director de Broking, Health Solutions en AON México"
        },
        {
          "name": "Luz Bravo",
          "role": "Coordinación de Redes Médicas y Convenios en Palig México"
        }
      ]
    },
    {
      "id": "experiencia-internacional-7",
      "track": "Experiencia internacional",
      "title": "Lecciones globales: ¿qué modelos podrían funcionar en México?",
      "moderator": {
        "name": "Jorge Carreño",
        "role": "Providers Services Representative México en Vumi"
      },
      "panelists": [
        {
          "name": "Bruno Valera",
          "role": "CEO & Fundador en Medikit"
        },
        {
          "name": "María Esther Cárdenas Leal",
          "role": "Vinculación Corporativa Comercial de Seguros nacionales e internacionales en Grupo Amerimed"
        },
        {
          "name": "Jimena Cejudo",
          "role": "Mexico Country Manager en Baptist Health International"
        },
        {
          "name": "Jorge Rodríguez",
          "role": "Director Healthcare Risk Management LATAM en Global Excel"
        }
      ]
    },
    {
      "id": "visi-n-8",
      "track": "Visión",
      "title": "¿Qué necesita el ramo para sobrevivir los próximos 10 años?",
      "moderator": {
        "name": "Alexí López Neri",
        "role": "Directora de Operaciones en WeeCompany"
      },
      "panelists": [
        {
          "name": "Raúl Tapia",
          "role": "Senior VP, Riesgos Especiales y Responsabilidad Civil en Hylant México"
        },
        {
          "name": "Rafael Rebollar Fernández",
          "role": "President, Hylant México, E-Commerce & Affinities · Seguros en Imagen"
        },
        {
          "name": "Mabel Marrón",
          "role": "Subdirectora Función Actuarial en Seguros Ve por Más"
        },
        {
          "name": "Elizabeth Calderón",
          "role": "Dirección General en CAPA Soluciones Jurídicas"
        },
        {
          "name": "Pedro de la Cruz",
          "role": "Subdirector de Operaciones en Plan Seguro"
        }
      ]
    }
  ]
} as const;

export const editions = [
  { id: 'mer', label: 'M?rida 2025' },
  { id: 'mty', label: 'Monterrey 2026' },
  { id: 'prox', label: 'Pr?ximamente' },
] as const satisfies readonly { id: EditionId; label: string }[];
