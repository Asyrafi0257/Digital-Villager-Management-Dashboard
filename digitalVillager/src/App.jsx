import Home from "./home";
import Navbar from "./nav";
import About from "./about";
import Footer from "./footer";
import Contact from "./contact";
import Dashboard from "./villager/dashboard";
import {BrowserRouter, Routes, Route} from "react-router-dom";

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
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>}></Route>
        <Route path="/villager" element={<Dashboard/>}/>
      </Routes>
     </BrowserRouter>
    </div>
  )
}

export default App
