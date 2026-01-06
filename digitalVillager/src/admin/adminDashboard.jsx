import { useState } from "react";
import styles from "./adminDashboard.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faDownload, faEye, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

import HqDashboard from "./hqdashboard";
import IncidentMap from "./incidentMap";
import Logout from "./logout";
import ManageIncident from "./ManageIncidents";
import ManageUsers from "./ManageUsers";
import ViewVictims from "./viewvictims";
import UpdateAnnoucement from "./updateAnnoucement";

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const menuItems = [
    { icon: faHouse, text: "Dashboard" },
    { icon: faDownload, text: "Manage Incident" },
    { icon: faEye, text: "Incident Map" },
    { icon: faEye, text: "View Victims" },
    { icon: faEye, text: "Manage User" },
    { icon: faEye, text: "Update Annoucement" },
    { icon : faRightFromBracket, text : "Logout" },
  ];

  //handle back page
  const handleBackPage = (index) => {
    if(index === 7){
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
            <p className={styles.titleVillager}>Admin</p>
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
              <HqDashboard/>
            </>
          )}
            {activeIndex === 1 && <ManageIncident/>}
            {activeIndex === 2 && <IncidentMap/>}
            {activeIndex === 3 && <ViewVictims/>}
            {activeIndex === 4 && <ManageUsers/>}
            {activeIndex === 5 && <UpdateAnnoucement/>}
            {activeIndex === 6 && <Logout/>}
            
      </div>


      </div>
    </div>
  );
}
