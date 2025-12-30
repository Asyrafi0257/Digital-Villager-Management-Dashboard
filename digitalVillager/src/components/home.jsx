import Plan from "../assets/images/plan.jpg"
import styles from "../components/home.module.css";

export default function Home(){
    return (
        //main land page
        <div className={styles.container} id="home">
            <div className={styles.contain}>
                <div className={styles.info}>
                    <div className={styles.title}>
                        <div className={styles.titleInfo}>
                           <h3>EMERGENCY & DISASTER MANAGEMENT</h3>
                           <p>Emergency & Disaster Management refers to the process of planning, coordinating, and implementing actions to handle emergencies or disasters. Its main goal is to protect lives, property, and the environment while ensuring quick recovery after a disaster occurs.</p> 
                        </div>
                        
                        
                    </div>
                </div>
                <div className={styles.images}>
                    <img src={Plan} alt="plan" />
                </div>
            </div>
        </div>
        
    )
}