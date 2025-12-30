import styles from "./nav.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";

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
                        <li className={styles.btn}>
                            <Link to="/login" className={styles.link}>
                                Login
                            </Link>
                            
                        </li>
                        <li className={styles.btnStarted}>
                            <Link to="/villager" className={styles.link}>
                                Get Started
                                <FontAwesomeIcon className={styles.arrowRight} icon={faArrowRight} />
                            </Link>
                            
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}