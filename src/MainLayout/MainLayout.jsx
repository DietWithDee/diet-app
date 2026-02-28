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
import Terms from "../Pages/Terms/Terms";
import Privacy from "../Pages/Privacy/Privacy";
import ScrollToTop from "../utils/ScrollToTop";
import PaymentSuccess from "../Pages/ContactUs/PaymentSuccess";
import MyJourney from "../Pages/MyJourney/MyJourney";
import TestEmails from "../Components/TestEmails";
import { AuthProvider } from "../AuthContext";

const MainLayout = () => {
  return (
    <AuthProvider>
      <SEOProvider>
        <BrowserRouter basename="/">
          <ScrollToTop />
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<Blog />} />
            <Route path="/contactUs" element={<ContactUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/knowYourBody" element={<KnowYourBody />} />
            <Route path="/my-journey" element={<MyJourney />} />
            <Route path="/admin" element={<AdminApp />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/paymentSuccess" element={<PaymentSuccess />} />
            <Route path="/test" element={<TestEmails />} />
            <Route path="*" element={<Error />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </SEOProvider>
    </AuthProvider>
  );
};

export default MainLayout;

