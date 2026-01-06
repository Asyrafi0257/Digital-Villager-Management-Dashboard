import { useState } from "react";
import styles from "./penghuluDash.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faDownload, faEye, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

import Logout from "./logout";
import ViewVictim from "./viewvictims";
import MapIncident from "./incidentMap";
import ManageIncident from "./ManageIncidents";
import PenghuluDashboard from "./penghuluDashboard";

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const menuItems = [
    { icon: faHouse, text: "Dashboard" },
    { icon: faDownload, text: "Manage Incident" },
    { icon: faEye, text: "Map Incident" },
    { icon : faEye, text : "View Victims" },
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
            <p className={styles.titleVillager}>Penghulu</p>
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
              <PenghuluDashboard/>
            </>
          )}
            {activeIndex === 1 && <ManageIncident/>}
            {activeIndex === 2 && <MapIncident/>}
            {activeIndex === 3 && <ViewVictim/>}
            {activeIndex === 4 && <Logout/>}
            
      </div>


      </div>
    </div>
  );
}
