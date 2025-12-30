import Home from "./components/home";
import Navbar from "./components/nav";
import About from "./components/about";
import Footer from "./components/footer";
import Contact from "./components/contact";
import Dashboard from "./villager/dashboard";
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
      </Routes>
     </BrowserRouter>
      </AuthProvider>
     
    </div>
  )
}

export default App
