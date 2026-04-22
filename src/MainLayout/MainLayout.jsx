import NavBar from "../Components/NavBar/NavBar";
import SEOProvider from "../Components/SEOProvider";
import AppErrorBoundary from "../Components/AppErrorBoundary";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "../Pages/Home/Home";
import About from "../Pages/About/About";
import Blog from "../Pages/Blog/Blog";
import ContactUs from "../Pages/ContactUs/ContactUs";
import Services from "../Pages/Services/Services";
import Error from "../Pages/Error/Error";
import Footer from '../Components/Footer/footer';
import KnowYourBody from "../Pages/KnowYourBody/KnowYourBody";
import AdminApp from "../Pages/Admin/AdminApp";
import Plans from "../Pages/Plans/Plans";
import Terms from "../Pages/Terms/Terms";
import Privacy from "../Pages/Privacy/Privacy";
import ScrollToTop from "../utils/ScrollToTop";
import PaymentSuccess from "../Pages/ContactUs/PaymentSuccess";
import MyJourney from "../Pages/MyJourney/MyJourney";
import TestEmails from "../Components/TestEmails";
import Unsubscribe from "../Pages/Unsubscribe/Unsubscribe";
import { AuthProvider } from "../AuthContext";
import { usePageTracking } from "../hooks/usePageTracking";
import InstallPrompt from "../Components/InstallPrompt";
import { ToastProvider } from "../Contexts/ToastContext";

// Inner component so usePageTracking can access the router context
const AppRoutes = () => {
  usePageTracking();
  return (
    <>
      <ScrollToTop />
      <InstallPrompt />
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slugOrId" element={<Blog />} />
        <Route path="/contactUs" element={<ContactUs />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/knowYourBody" element={<KnowYourBody />} />
        <Route path="/my-journey" element={<MyJourney />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/paymentSuccess" element={<PaymentSuccess />} />
        <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
        <Route path="/test" element={<TestEmails />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="*" element={<Error />} />
      </Routes>
      <Footer />
    </>
  );
};

const MainLayout = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppErrorBoundary>
          <SEOProvider>
            <BrowserRouter basename="/">
              <AppRoutes />
            </BrowserRouter>
          </SEOProvider>
        </AppErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  );
};

export default MainLayout;

