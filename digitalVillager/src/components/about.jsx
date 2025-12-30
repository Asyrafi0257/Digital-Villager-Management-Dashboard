import styles from "../components/about.module.css";
import Goal from "../assets/images/goal.jpg";
import Features from "../assets/images/features1.jpg";
import TargetUser from '../assets/images/targetUser.jpg';
import Emergency from "../assets/images/emergency2.jpg"

export default function About() {
    return (
        <section className={styles.container} id="about">
            <div className={styles.contain}>
                <div className={styles.title}>
                    <h2>About</h2>
                </div>
                <div className={styles.info}>
                    <div className={styles.card}>
                        <img src={Goal} alt="" />
                        <h3>Objective</h3>
                        <div className={styles.list}>
                            <ul>
                                <li>To improve disaster preparedness and awareness</li>
                                <li>To minimize loss of life and property during emergencies</li>
                                <li>To enhance community resilience through technology</li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <img src={Emergency} alt="" />
                        <h3>Emergency covered</h3>
                        <div className={styles.list}>
                            <ul>
                                <li>Floods</li>
                                <li>Fires</li>
                                <li>Earthquakes</li>
                                <li>Storms and extreme weather events</li>
                                <li>Disease outbreaks</li>
                                <li>Major accidents and public emergencies</li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <img src={TargetUser} alt="" />
                        <h3>Target User</h3>
                        <div className={styles.list}>
                            <ul>
                                <li>General public</li>
                                <li>Emergency response agencies</li>
                                <li>Volunteers and humanitarian organizations</li>
                                <li>Local authorities</li>
                                <li>NGO & badan bantuan</li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <img src={Features} alt="" />
                        <h3>Features</h3>
                        <div className={styles.list}>
                            <ul>
                                <li>Early warning and alert notifications</li>
                                <li>Emergency safety guidelines and procedures</li>
                                <li>Incident reporting and real-time updates</li>
                                <li>Location information for evacuation and relief centers</li>
                            </ul>
                        </div>
                    </div>  
                </div>
                
            </div>
        </section>
    )
}