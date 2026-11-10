import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { AboutPage, AdminPage, AuthPage, CampaignDetailPage, CampaignsPage, CommunityPage, ContactPage, DashboardPage, HomePage } from './pages';

function RouteGuard({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-forest-700">Loading SocialCause...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-forest-700">Loading SocialCause...</div>;
  return user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : children;
}

function NotFoundPage() {
  return <section className="container-shell section-pad text-center"><p className="eyebrow justify-center">404 · Not found</p><h1 className="mt-4 text-4xl font-bold">This page wandered off.</h1><p className="mt-3 text-stone-500">Let's get you back to the good stuff.</p><a href="/" className="button-primary mt-6">Back to home</a></section>;
}

export default function App() {
  return <>
    <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<GuestRoute><AuthPage mode="login" /></GuestRoute>} />
        <Route path="register" element={<GuestRoute><AuthPage mode="register" /></GuestRoute>} />
        <Route path="dashboard" element={<RouteGuard><DashboardPage /></RouteGuard>} />
        <Route path="admin" element={<RouteGuard admin><AdminPage /></RouteGuard>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </>;
}
