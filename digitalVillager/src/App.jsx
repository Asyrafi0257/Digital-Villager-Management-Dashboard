import Home from "./components/home";
import Navbar from "./components/nav";
import About from "./components/about";
import Footer from "./components/footer";
import Contact from "./components/contact";
import Dashboard from "./villager/dashboard";
import KKDashboard from "./headVillager/kampungDashboard";
import PenghuluDashboard from "./penghulu/penghuluDash";
import Admin from "./admin/adminDashboard";
import DistrictOfficer from "./districtOfficer/officerDashboard";
import Login from "./auth/login";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import { AuthProvider } from "./auth/authContext";

function LandingPage() {
  return(
    <div>
      <Navbar/>
      <Home />
      <About/>
      <Contact/>
      <Footer/>
    </div>
  )
}

function App() {
  return (
    <div>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage/>}></Route>
            <Route path="/villager" element={<Dashboard/>}/>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/kampungDashboard" element={<KKDashboard/>}></Route>
            <Route path="/penghuluDash" element={<PenghuluDashboard/>}></Route>
            <Route path="/adminDashboard" element={<Admin/>}></Route>
            <Route path="/officerDashboard" element={<DistrictOfficer/>}></Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
     
    </div>
  )
}

export default App
