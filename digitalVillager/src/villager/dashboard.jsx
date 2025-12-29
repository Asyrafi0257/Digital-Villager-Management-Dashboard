import { useState } from "react";
import styles from "./dashboard.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faDownload, faEye } from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(null);

  const menuItems = [
    { icon: faHouse, text: "Dashboard" },
    { icon: faDownload, text: "Submit Incident" },
    { icon: faEye, text: "View Approve" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.contain}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.containTitle}>
            <div className={styles.title}>DVMD</div>
            <p className={styles.titleVillager}>Villager</p>
          </div>

          <div className={styles.list}>
            <ul>
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className={activeIndex === index ? styles.active : ""}
                  onClick={() => setActiveIndex(index)}
                >
                  <FontAwesomeIcon icon={item.icon} className={styles.icons} />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.context}>
          {activeIndex !== null ? <p>{menuItems[activeIndex].text}</p> : <p>Dashboard</p>}
        </div>
      </div>
    </div>
  );
}
