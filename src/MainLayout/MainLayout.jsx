import NavBar from "../Components/NavBar/NavBar";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "../Pages/Home/Home";
import About from "../Pages/About/About";
import Blog from "../Pages/Blog/Blog";
import ContactUs from "../Pages/ContactUs/ContactUs";
import Services from "../Pages/Services/Services";
import Error from "../Pages/Error/Error";
import Footer from '../Components/Footer/footer';
import KnowYourBody from "../Pages/KnowYourBody/KnowYourBody";
import AdminApp from "../Pages/Admin/admin";
import Plans from "../Pages/Plans/Plans";
import ScrollToTop from "../utils/ScrollToTop"; 

const MainLayout = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <NavBar />
      <Routes>
        <Route path="/diet-app" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/diet-app/about" element={<About />} />
        <Route path="/diet-app/blog" element={<Blog />} />
        <Route path="/diet-app/contactUs" element={<ContactUs />} />
        <Route path="/diet-app/services" element={<Services />} />
        <Route path="/diet-app/knowYourBody" element={<KnowYourBody />} />
        <Route path="/diet-app/admin" element={<AdminApp />} />
        <Route path="/diet-app/plans" element={<Plans />} />
        <Route path="*" element={<Error />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default MainLayout;
