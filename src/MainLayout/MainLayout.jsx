import NavBar from "../Components/NavBar/NavBar";
import { BrowserRouter , Route , Routes } from "react-router";
import Home from "../Pages/Home/Home";
import About from "../Pages/About/About";
import Blog from "../Pages/Blog/Blog";
import ContactUs from "../Pages/ContactUs/ContactUs";
import Services from "../Pages/Services/Services";
import Error from "../Pages/Error/Error";
import Footer from '../Components/Footer/footer'
import KnowYourBody from "../Pages/KnowYourBody/KnowYourBody";


const MainLayout = () => {
  return (
    
    <BrowserRouter>
 {/* navbar */}

   <NavBar />
    <Routes>
      <Route path="/diet-app" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/contactUs" element={<ContactUs />} />
      <Route path="/services" element={<Services />} />
      <Route path="/knowYourBody" element={<KnowYourBody/>} />

      {/* not found Pages */}
      <Route path="*" element={<Error />} />
    </Routes>
    <Footer />
    </BrowserRouter>
  )
}

export default MainLayout;