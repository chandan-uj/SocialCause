import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HeartHandshake, Menu, X, LogOut, CircleUserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const links = [['Explore', '/campaigns'], ['Community', '/community'], ['About', '/about']];

export function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  async function signOut() {
    try {
      await logout();
      toast.success('You are signed out.');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  }
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-stone-100 bg-white/95 backdrop-blur">
        <nav className="container-shell flex h-[76px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-extrabold tracking-tight text-forest-700" onClick={() => setOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest-600 text-white"><HeartHandshake size={22} /></span>
            <span className="text-xl">Social<span className="text-forest-500">Cause</span></span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {links.map(([label, to]) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'text-forest-700' : ''}`}>{label}</NavLink>)}
            {user ? <>
              <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} className="nav-link">My space</NavLink>
              <button onClick={signOut} className="nav-link inline-flex items-center gap-2"><LogOut size={16} /> Sign out</button>
            </> : <Link to="/login" className="nav-link inline-flex items-center gap-2"><CircleUserRound size={17} /> Sign in</Link>}
            <Link to="/campaigns" className="button-primary !px-5 !py-2.5">Find a cause</Link>
          </div>
          <button aria-label="Toggle navigation" onClick={() => setOpen(!open)} className="rounded-xl p-2 text-stone-700 md:hidden">
            {open ? <X /> : <Menu />}
          </button>
        </nav>
        {open && <div className="border-t border-stone-100 bg-white px-6 py-4 md:hidden">
          <div className="container-shell flex flex-col gap-4">
            {links.map(([label, to]) => <Link key={to} onClick={() => setOpen(false)} to={to} className="nav-link">{label}</Link>)}
            {user ? <><Link onClick={() => setOpen(false)} to={user.role === 'admin' ? '/admin' : '/dashboard'} className="nav-link">My space</Link><button onClick={signOut} className="nav-link text-left">Sign out</button></> : <Link onClick={() => setOpen(false)} to="/login" className="nav-link">Sign in</Link>}
            <Link onClick={() => setOpen(false)} to="/campaigns" className="button-primary">Find a cause</Link>
          </div>
        </div>}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="bg-forest-900 text-white">
        <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold"><HeartHandshake /> SocialCause</Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">A community-powered platform helping people find their cause and take action together.</p>
          </div>
          <div><h3 className="font-semibold">Discover</h3><div className="mt-4 grid gap-3 text-sm text-white/70"><Link to="/campaigns">Explore campaigns</Link><Link to="/community">Community stories</Link><Link to="/about">Our mission</Link></div></div>
          <div><h3 className="font-semibold">Get in touch</h3><div className="mt-4 grid gap-3 text-sm text-white/70"><Link to="/contact">Contact us</Link><Link to="/register">Join the community</Link></div></div>
        </div>
        <div className="border-t border-white/10"><div className="container-shell py-5 text-xs text-white/60">© {new Date().getFullYear()} SocialCause. Built for communities that care.</div></div>
      </footer>
    </div>
  );
}
