import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={`${styles.scope} cn-style-d5d3f980`}>
      <div className="cn-style-08808b1c">
        <div className="cn-style-82eac36c">
          <div className="cn-style-279fdf64">
            <img
              src="/assets/f150ad1413ceb185dff1f5da66133803.png"
              alt="Congreso Nacional Aseguradoras y Hospitales"
              width="220"
              height="60"
              loading="lazy"
              className="cn-style-3a45e932"
            />
            <span className="cn-style-806b1d23">
              El encuentro anual de aseguradoras, hospitales, médicos, agentes y proveedores
              de salud en México. 3ª edición: Guadalajara, 1 al 4 de septiembre de 2027.
            </span>
          </div>
          <div className="cn-style-79f59dc1">
            <span className="cn-style-aae571b0">El congreso</span>
            <a href="#paneles" className="cn-style-4d421fb9">Paneles 2026</a>
            <a href="#sede" className="cn-style-4d421fb9">3ª edición</a>
          </div>
          <div className="cn-style-79f59dc1">
            <span className="cn-style-aae571b0">Participa</span>
            <a href="#espacios" className="cn-style-4d421fb9">Patrocina</a>
            <a href="#patrocinio" className="cn-style-4d421fb9">Contacto de patrocinio</a>
          </div>
          <div className="cn-style-e6529424">
            <span className="cn-style-aae571b0">Organiza</span>
            <span>WeeCompany</span>
            <span>Producción: Hudle</span>
          </div>
        </div>
        <div className="cn-style-a7aebc8f">
          <span>© 2026 Congreso Nacional Aseguradoras y Hospitales · WeeCompany</span>
          <span className="cn-style-a7fd682b">
            <a href="mailto:congreso@weecompany.net">congreso@weecompany.net</a>
            <span className="cn-style-3bb8a8ec">
              #SinergiaDe2Perspectivas #WeeCompany
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
