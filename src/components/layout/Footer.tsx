import styles from './Footer.module.css'

export function Footer () {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <img
            src='/assets/f150ad1413ceb185dff1f5da66133803.png'
            alt='Congreso Nacional Aseguradoras y Hospitales'
          />
          <p>
            El encuentro anual de aseguradoras, hospitales, médicos, agentes y
            proveedores de salud en México.
          </p>
        </div>
        <div>
          <strong>El congreso</strong>
          <a href='#paneles'>Paneles 2026</a>
          <a href='#sede'>3ª edición</a>
        </div>
        <div>
          <strong>Participa</strong>
          <a href='#espacios'>Patrocina</a>
          <a href='#patrocinio'>Contacto</a>
        </div>
        <div>
          <strong>Organiza</strong>
          <span>WeeCompany</span>
          <span>Producción: Hudle</span>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© 2026 Congreso Nacional Aseguradoras y Hospitales</span>
        <a href='mailto:congreso@weecompany.net'>congreso@weecompany.net</a>
      </div>
    </footer>
  )
}
