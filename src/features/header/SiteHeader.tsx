import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <>
      <a className="cn-skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className={`${styles.scope} cn-style-3627b8b9`}>
        <div className="cn-style-8ba1d008">
          <a href="#inicio" className="cn-style-aec8477d">
            <img
              src="/assets/f150ad1413ceb185dff1f5da66133803.png"
              alt="Congreso Nacional Aseguradoras y Hospitales · Sinergia de perspectivas"
              width="278"
              height="76"
              className="cn-style-bc4d7310"
            />
          </a>
          <nav aria-label="Principal" className="cn-style-eb65b16b">
            <a href="#paneles" className="cn-style-435e42ad">Paneles 2026</a>
            <a href="#patrocinadores" className="cn-style-435e42ad">Patrocinadores</a>
            <a href="#patrocinio" className="cn-style-38b4b987">Patrocina 2027</a>
          </nav>
        </div>
      </header>
    </>
  );
}
