import { useState } from "react";
import styles from "./kampungDashboard.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faDownload, faEye, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

import KKDashboard from "./kkDashboard";
import RegisterForm from "./registervictim";
import ViewVictim from "./viewvictims";
import Logout from "../headVillager/logout";
import ManageIncident from "../headVillager/ManageIncidents";

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const menuItems = [
    { icon: faHouse, text: "Dashboard" },
    { icon: faDownload, text: "Register Victim" },
    { icon: faEye, text: "View Victim" },
    { icon: faEye, text: "Managae Incident" },
    { icon : faRightFromBracket, text : "Logout" },
  ];

  //handle back page
  const handleBackPage = (index) => {
    if(index === 4){
      navigate(-1);
    } else {
      setActiveIndex(index);
    }
}
  return (
    <div className={styles.container}>
      <div className={styles.contain}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.containTitle}>
            <div className={styles.title}>DVMD</div>
            <p className={styles.titleVillager}>Head Villager</p>
          </div>

          <div className={styles.list}>
            <ul>
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className={activeIndex === index ? styles.active : ""}
                  onClick={() => handleBackPage(index)}
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
 
          {activeIndex === 0 && (
            <>
              <KKDashboard/>
            </>
          )}
            {activeIndex === 1 && <RegisterForm/>}
            {activeIndex === 2 && <ViewVictim/>}
            {activeIndex === 3 && <ManageIncident/>}
            {activeIndex === 4 && <Logout/>}
            
      </div>


      </div>
    </div>
  );
}
