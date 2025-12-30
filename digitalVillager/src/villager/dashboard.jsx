import { useState } from "react";
import styles from "./dashboard.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faDownload, faEye, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

import DashboardStat from "./dashStat";
import IncidentMap from "./incidentMap";
import IncidentForm from "./incidentForm";
import ViewApprove from "./viewApprove";

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const menuItems = [
    { icon: faHouse, text: "Dashboard" },
    { icon: faDownload, text: "Submit Incident" },
    { icon: faEye, text: "View Approve" },
    { icon : faRightFromBracket, text : "Back Page" },
  ];

  //handle back page
  const handleBackPage = (index) => {
    if(index === 3){
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
            <p className={styles.titleVillager}>Villager</p>
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
              <DashboardStat />
              <IncidentMap />
            </>
          )}
            {activeIndex === 1 && <IncidentForm />}
            {activeIndex === 2 && <ViewApprove />}
            
      </div>


      </div>
    </div>
  );
}
