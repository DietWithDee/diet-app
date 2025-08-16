import NavBar from "../Components/NavBar/NavBar";
import SEOProvider from "../Components/SEOProvider";
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
import PaymentSuccess from "../Pages/ContactUs/PaymentSuccess";

const MainLayout = () => {
  return (

    <SEOProvider>
      <BrowserRouter basename="/">
        <ScrollToTop />
        <NavBar />
        <Routes>
          <Route path="/diet-app" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contactUs" element={<ContactUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/knowYourBody" element={<KnowYourBody />} />
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/paymentSuccess" element={<PaymentSuccess />} />
          <Route path="*" element={<Error />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </SEOProvider>

  );
};

export default MainLayout;
