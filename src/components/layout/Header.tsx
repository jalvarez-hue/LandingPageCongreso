import styles from './Header.module.css'

export function Header () {
  return (
    <header className={styles.header}>
      <a className={styles.brand} href='#inicio'>
        <img
          src='/assets/f150ad1413ceb185dff1f5da66133803.png'
          alt='Congreso Nacional Aseguradoras y Hospitales'
        />
      </a>
      <nav aria-label='Principal'>
        <a href='#paneles'>Paneles 2026</a>
        <a href='#patrocinadores'>Patrocinadores</a>
        <a className={styles.cta} href='#patrocinio'>
          Patrocina 2027
        </a>
      </nav>
    </header>
  )
}
