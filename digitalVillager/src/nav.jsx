import styles from "./nav.module.css";

export default function Navbar() {

    const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth" });
  };
    return (
        <div className={styles.container}>
            <div className={styles.navbar}>
                <div className={styles.logo}>DVMD</div>
                <div className={styles.menu}>
                    <ul>
                        <li className={styles.btn} onClick={() => scrollToSection("home")}>Home</li>
                        <li className={styles.btn} onClick={() => scrollToSection("about")}>About</li>
                        <li className={styles.btn} onClick={() => scrollToSection("contact")}>Contact Us</li>
                        <li className={styles.btn}>Login</li>
                        <li className={styles.btn}>Sign Up</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}