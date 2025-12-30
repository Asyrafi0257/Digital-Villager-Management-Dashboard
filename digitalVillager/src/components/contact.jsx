import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import {faTiktok} from '@fortawesome/free-brands-svg-icons';
import {faInstagram} from '@fortawesome/free-brands-svg-icons';

import styles from "./contact.module.css";

export default function Contact() {
    return (
        <div className={styles.container} id='contact'>
            <div className={styles.contain}>
                <div className={styles.contactInfo}>
                    <div className={styles.title}>
                        <h2>Contact Us</h2>
                    </div>
                    <p>If you have questions, require assistance, or need to report an emergency-related incident, please contact us using the information below.</p>
                    <div className={styles.contact}>
                        <div className={styles.icons}>
                            <FontAwesomeIcon icon={faFacebook} className={styles.icon}/>
                            <p>Facebook</p>

                        </div>
                        <div className={styles.icons}>
                            <FontAwesomeIcon icon={faTiktok} />
                            <p>TikTok</p>

                        </div>
                        <div className={styles.icons}>
                            <FontAwesomeIcon icon={faInstagram} />
                            <p>Instagram</p>
                        </div>  
                    </div>
                </div>
                
                <div className={styles.contactForm}>
                    <div className={styles.title}>
                        <h2>Send us a message</h2>
                    </div>
                    <div className={styles.form}>
                        <form action="">
                            <label className={styles.label}>Name </label><br/>
                            <input type="text" className={styles.input} placeholder='Your Name'/> <br />

                            <label className={styles.label}>Email</label><br/>
                            <input type="email" className={styles.input} placeholder='Email'/> <br />

                            <label className={styles.label}>Message</label><br/>
                           <textarea className={styles.textarea} placeholder='Your Message'></textarea> <br />

                           <button className={styles.btn}>Submit</button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}