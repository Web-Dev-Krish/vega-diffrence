import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Venues from './pages/Venues';
import VenueDetails from './pages/VenueDetails';
import Events from './pages/Events';
import SignatureEvents from './pages/SignatureEvents';
import Catering from './pages/Catering';
import Blogs from './pages/Blogs';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminBookings from './pages/admin/Bookings';
import AdminVenues from './pages/admin/Venues';
import AdminEvents from './pages/admin/Events';
import AdminCatering from './pages/admin/Catering';
import AdminBlogs from './pages/admin/Blogs';
import AdminReviews from './pages/admin/Reviews';
import AdminSettings from './pages/admin/Settings';
import AdminSignatureEvents from './pages/admin/SignatureEvents';
import AdminGallery from './pages/admin/Gallery';
import AdminVideos from './pages/admin/Videos';
import AdminCalendar from './pages/admin/Calendar';
import AdminCustomers from './pages/admin/Customers';
import AdminFaqs from './pages/admin/Faqs';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="venues" element={<Venues />} />
            <Route path="venues/:id" element={<VenueDetails />} />
            <Route path="events" element={<Events />} />
            <Route path="signature-events" element={<SignatureEvents />} />
            <Route path="catering" element={<Catering />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Public Admin Login Route */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="venues" element={<AdminVenues />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="catering" element={<AdminCatering />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<AdminSettings />} />
            
            <Route path="signature-events" element={<AdminSignatureEvents />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="faqs" element={<AdminFaqs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
