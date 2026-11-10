import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, Heart, HeartHandshake, Leaf, LoaderCircle, MapPin, Search, ShieldCheck, Sprout, Users, Globe2, MessageCircle, Send, Plus, Trash2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './services/api';
import { useAuth } from './context/AuthContext';
import { CampaignCard, SectionHeading } from './components/CampaignCard';

const categories = [
  'Agriculture and farmer welfare', 'Education and digital literacy', 'Environmental protection',
  'Poverty alleviation', 'Healthcare awareness', 'Animal welfare', 'Women empowerment', 'Community development'
];
const photos = {
  hero: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1800&q=85',
  environment: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
  education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
  community: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=80'
};

function Loading({ label = 'Loading...' }) {
  return <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-stone-500"><LoaderCircle className="animate-spin text-forest-600" size={20} />{label}</div>;
}
function ErrorState({ children }) {
  return <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{children}</div>;
}
function EmptyState({ title, description, action }) {
  return <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-forest-50 text-forest-600"><HeartHandshake /></div><h3 className="mt-4 font-bold text-stone-900">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function HomePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [impact, setImpact] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    Promise.all([api.get('/campaigns?limit=3&sort=newest'), api.get('/campaigns/impact')])
      .then(([campaignResult, impactResult]) => {
        setCampaigns(campaignResult.data.data.items);
        setImpact(impactResult.data.data);
      }).catch((reason) => setError(reason.message));
  }, []);
  return <>
    <section className="hero-surface relative overflow-hidden">
      <div className="container-shell grid min-h-[610px] items-center gap-10 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white/80 px-4 py-2 text-sm font-semibold text-forest-700"><Sprout size={16} /> Good things grow together</span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-forest-900 sm:text-6xl">Small Actions.<br /><span className="text-forest-600">Meaningful Change.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">Find the causes that move you. Meet your community. Make a difference that lasts.</p>
          <form onSubmit={(event) => { event.preventDefault(); navigate(`/campaigns?search=${encodeURIComponent(search)}`); }} className="mt-8 flex max-w-xl rounded-2xl border border-stone-200 bg-white p-2 shadow-soft">
            <Search className="ml-3 mt-2.5 shrink-0 text-stone-400" size={20} /><input aria-label="Search campaigns" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search causes, campaigns, or places" className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 outline-none placeholder:text-stone-400" /><button className="button-primary !px-5">Explore</button>
          </form>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500"><span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-forest-600" /> Community-led action</span><span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-forest-600" /> Causes that matter</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[620px]">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-forest-100/60 rotate-3" />
          <img className="relative h-[390px] w-full rounded-[2rem] object-cover shadow-soft sm:h-[470px]" src={photos.hero} alt="Neighbors working together at a community event" />
          <div className="absolute -bottom-5 left-4 rounded-2xl bg-white p-4 shadow-soft sm:left-[-26px] sm:p-5"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-forest-50 text-forest-700"><Users /></div><div><p className="text-lg font-bold text-stone-900">{impact ? impact.volunteers.toLocaleString() : '—'} people</p><p className="text-xs text-stone-500">showing up for their community</p></div></div></div>
          <div className="absolute right-3 top-5 rounded-2xl bg-white/95 p-4 shadow-soft sm:right-[-18px]"><p className="text-xs font-semibold uppercase tracking-wider text-forest-600">Together, we can</p><p className="mt-1 text-sm font-bold text-stone-900">make good things happen</p></div>
        </div>
      </div>
    </section>
    <section className="section-pad">
      <div className="container-shell"><SectionHeading eyebrow="Explore what matters" title="A cause for every kind of caring" description="From greener neighborhoods to brighter futures, find a place where your time can make a difference." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category, index) => <Link key={category} to={`/campaigns?category=${encodeURIComponent(category)}`} className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-1 hover:border-forest-200 hover:shadow-soft"><span className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${['bg-amber-50 text-amber-700', 'bg-sky-50 text-sky-700', 'bg-forest-50 text-forest-700', 'bg-rose-50 text-rose-700'][index % 4]}`}><Leaf size={20} /></span><h3 className="font-semibold leading-snug text-stone-800 group-hover:text-forest-700">{category}</h3><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">Explore <ArrowRight size={15} /></span></Link>)}</div>
      </div>
    </section>
    <section className="section-pad bg-white"><div className="container-shell"><SectionHeading eyebrow="How it works" title="Three steps. A whole lot of good." description="Getting involved should feel simple. Start wherever you are." />
      <div className="grid gap-5 md:grid-cols-3">{[
        ['01', 'Find a cause', 'Explore local campaigns that connect with what you care about.'],
        ['02', 'Show up together', 'Join a campaign and meet the people already making change happen.'],
        ['03', 'Share the good', 'Tell your story, support a neighbor, and inspire the next small action.']
      ].map(([number, title, description]) => <div key={number} className="rounded-3xl border border-stone-200 p-6"><span className="text-sm font-extrabold tracking-widest text-forest-600">{number}</span><h3 className="mt-4 text-xl font-bold text-stone-900">{title}</h3><p className="mt-2 leading-6 text-stone-600">{description}</p></div>)}</div>
    </div></section>
    <section className="section-pad bg-sand"><div className="container-shell"><SectionHeading eyebrow="Make it real" title="Campaigns worth showing up for" description="Meet the people already doing the work—and find a practical way to join them." action={<Link to="/campaigns" className="button-outline">Browse all campaigns <ArrowUpRight size={16} /></Link>} />
      {error ? <ErrorState>{error}</ErrorState> : campaigns.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{campaigns.map((campaign) => <CampaignCard key={campaign._id} campaign={campaign} />)}</div> : <EmptyState title="New campaigns are on the way" description="Check back soon to discover community-led initiatives." />}
    </div></section>
    <section className="section-pad"><div className="container-shell grid items-center gap-12 lg:grid-cols-2">
      <div className="relative"><img src={photos.community} className="h-[420px] w-full rounded-[2rem] object-cover" alt="Volunteers collaborating on a community initiative" /><div className="absolute -bottom-5 right-4 rounded-2xl bg-white p-5 shadow-soft sm:right-[-20px]"><p className="text-3xl font-extrabold text-forest-700">{impact ? impact.campaigns.toLocaleString() : '—'}+</p><p className="mt-1 text-sm text-stone-500">campaigns moving communities forward</p></div></div>
      <div><p className="eyebrow"><Globe2 size={14} /> Our collective impact</p><h2 className="mt-3 text-4xl font-bold tracking-tight text-stone-900">Change starts when we show up for each other.</h2><p className="mt-5 leading-7 text-stone-600">Every hour volunteered, every story shared, every neighbor supported adds up. SocialCause brings people and local initiatives together so action feels possible—and powerful.</p>
        <div className="mt-8 grid grid-cols-2 gap-4">{[['Active causes', impact?.activeCampaigns], ['Volunteers joined', impact?.volunteers]].map(([label, count]) => <div key={label} className="rounded-2xl bg-forest-50 p-5"><p className="text-3xl font-bold text-forest-700">{count == null ? '—' : count.toLocaleString()}</p><p className="mt-1 text-sm text-stone-600">{label}</p></div>)}</div>
        <Link to="/about" className="button-primary mt-7">Our story <ArrowRight size={17} /></Link>
      </div>
    </div></section>
    <section className="bg-forest-700 py-16 text-white"><div className="container-shell flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-[.16em] text-white/70">Your community needs you</p><h2 className="mt-2 text-3xl font-bold">Ready to turn caring into action?</h2></div><Link to={user ? '/campaigns' : '/register'} className="button-white">{user ? 'Find your next cause' : 'Join the community'} <ArrowRight size={17} /></Link></div></section>
  </>;
}

export function CampaignsPage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const search = params.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const category = params.get('category') || '';
  const status = params.get('status') || '';
  const location = params.get('location') || '';
  const page = Number(params.get('page') || 1);
  useEffect(() => setSearchInput(search), [search]);
  useEffect(() => {
    setLoading(true); setError('');
    const query = new URLSearchParams({ page: String(page), limit: '9', sort: params.get('sort') || 'newest' });
    if (search) query.set('search', search);
    if (category) query.set('category', category);
    if (status) query.set('status', status);
    if (location) query.set('location', location);
    api.get(`/campaigns?${query}`).then(({ data }) => { setItems(data.data.items); setMeta(data.data); }).catch((reason) => setError(reason.message)).finally(() => setLoading(false));
  }, [search, category, status, location, page, params]);
  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }
  return <section className="section-pad bg-sand min-h-[70vh]"><div className="container-shell">
    <div className="max-w-2xl"><p className="eyebrow"><Leaf size={14} /> Find your next step</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">Explore campaigns</h1><p className="mt-4 text-stone-600">Discover community-led work and find a meaningful way to take part.</p></div>
    <div className="mt-8 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr_1fr]">
      <form onSubmit={(event) => { event.preventDefault(); update('search', searchInput); }} className="flex items-center rounded-xl border border-stone-200 px-3"><Search size={18} className="text-stone-400" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search campaigns" aria-label="Search campaigns" className="w-full border-0 px-3 py-3 outline-none" /></form>
      <select aria-label="Filter by cause" value={category} onChange={(event) => update('category', event.target.value)} className="form-input"><option value="">All causes</option>{categories.map((value) => <option key={value}>{value}</option>)}</select>
      <select aria-label="Filter by status" value={status} onChange={(event) => update('status', event.target.value)} className="form-input"><option value="">All statuses</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
      <input aria-label="Filter by location" value={location} onChange={(event) => update('location', event.target.value)} placeholder="Location" className="form-input" />
      <select aria-label="Sort campaigns" value={params.get('sort') || 'newest'} onChange={(event) => update('sort', event.target.value)} className="form-input"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="endingSoon">Ending soon</option></select>
    </div>
    <div className="mt-6 flex items-center justify-between text-sm text-stone-500"><span>{meta.total} {meta.total === 1 ? 'campaign' : 'campaigns'} to explore</span>{(search || category || location) && <button onClick={() => setParams({})} className="font-semibold text-forest-700">Clear filters</button>}</div>
    <div className="mt-5">{loading ? <Loading label="Finding campaigns..." /> : error ? <ErrorState>{error}</ErrorState> : items.length ? <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map((campaign) => <CampaignCard key={campaign._id} campaign={campaign} />)}</div>
      {meta.pages > 1 && <div className="mt-10 flex items-center justify-center gap-4"><button className="button-outline !px-3" disabled={page <= 1} onClick={() => update('page', String(page - 1))}><ChevronLeft size={18} /> Previous</button><span className="text-sm text-stone-500">Page {page} of {meta.pages}</span><button className="button-outline !px-3" disabled={page >= meta.pages} onClick={() => update('page', String(page + 1))}>Next <ChevronRight size={18} /></button></div>}
    </> : <EmptyState title="No campaigns found" description="Try another search or clear a filter to see more community initiatives." action={<button onClick={() => setParams({})} className="button-outline">Clear filters</button>} />}</div>
  </div></section>;
}

export function CampaignDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.get(`/campaigns/${id}`).then(({ data: result }) => setData(result.data)).catch((reason) => setError(reason.message));
    if (user) api.get('/volunteers/mine').then(({ data: result }) => {
      const registration = result.data.registrations.find((item) => item.campaign?._id === id && item.status === 'registered');
      setJoined(Boolean(registration)); setRegistrationId(registration?._id || null);
    }).catch(() => {});
  }, [id, user]);
  async function toggleJoin() {
    if (!user) return navigate('/login');
    setBusy(true);
    try {
      if (joined) await api.delete(`/volunteers/${registrationId}`);
      else {
        const { data: result } = await api.post(`/volunteers/${id}`);
        setRegistrationId(result.data.registration._id);
      }
      setJoined(!joined);
      const { data: refreshed } = await api.get(`/campaigns/${id}`);
      setData((previous) => ({ ...previous, campaign: refreshed.data.campaign }));
      toast.success(joined ? 'Registration cancelled.' : 'You are in! Thanks for volunteering.');
    } catch (reason) { toast.error(reason.message); }
    finally { setBusy(false); }
  }
  if (error) return <section className="container-shell section-pad"><ErrorState>{error}</ErrorState></section>;
  if (!data) return <section className="container-shell section-pad"><Loading /></section>;
  const { campaign, related } = data;
  return <div className="section-pad"><div className="container-shell">
    <Link to="/campaigns" className="text-sm font-semibold text-forest-700">← All campaigns</Link>
    <div className="mt-5 overflow-hidden rounded-[2rem]"><img src={campaign.image || photos.environment} alt="" className="h-[300px] w-full object-cover sm:h-[430px]" /></div>
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_330px]">
      <article><span className="rounded-full bg-forest-50 px-3 py-1.5 text-sm font-semibold text-forest-700">{campaign.category}</span><h1 className="mt-4 text-4xl font-bold tracking-tight text-stone-900">{campaign.title}</h1><p className="mt-4 text-lg leading-8 text-stone-600">{campaign.shortDescription}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500"><span className="inline-flex items-center gap-1.5"><MapPin size={16} />{campaign.location}</span><span className="inline-flex items-center gap-1.5"><Users size={16} />{campaign.volunteerCount || 0} volunteers</span></div>
        <div className="prose mt-8 max-w-none whitespace-pre-line leading-7 text-stone-600">{campaign.description}</div>
        {!!campaign.goals?.length && <div className="mt-8"><h2 className="text-xl font-bold">What we hope to achieve</h2><ul className="mt-3 grid gap-2">{campaign.goals.map((goal, index) => <li key={index} className="flex gap-2 text-stone-600"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-forest-600" />{goal}</li>)}</ul></div>}
        <div className="mt-8 grid gap-4 rounded-2xl bg-sand p-5 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Starts</p><p className="mt-1 font-semibold">{new Date(campaign.startDate).toLocaleDateString()}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Ends</p><p className="mt-1 font-semibold">{new Date(campaign.endDate).toLocaleDateString()}</p></div></div>
      </article>
      <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:sticky lg:top-28">
        <p className="text-sm font-semibold text-forest-700">Be part of the change</p><h2 className="mt-2 text-2xl font-bold">Your time can make a difference.</h2><div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-forest-600" style={{ width: `${Math.min(100, (campaign.volunteerCount / campaign.volunteerCapacity) * 100)}%` }} /></div><p className="mt-2 text-sm text-stone-500">{campaign.volunteerCount} of {campaign.volunteerCapacity} volunteer spots filled</p>
        {campaign.status === 'active' ? <button disabled={busy || (!joined && campaign.volunteerCount >= campaign.volunteerCapacity)} onClick={toggleJoin} className={`mt-6 w-full ${joined ? 'button-outline' : 'button-primary'} disabled:cursor-not-allowed disabled:opacity-50`}>{busy ? 'Please wait...' : joined ? 'Cancel my registration' : campaign.volunteerCount >= campaign.volunteerCapacity ? 'Campaign is full' : user ? 'Join this campaign' : 'Sign in to volunteer'}</button> : <p className="mt-6 rounded-xl bg-stone-100 p-3 text-center text-sm font-medium capitalize text-stone-600">{campaign.status} campaign</p>}
        <button onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); toast.success('Campaign link copied.'); } catch { toast.error('Unable to copy link.'); } }} className="button-quiet mt-3 w-full"><Share2 size={17} /> Share campaign</button>
        <div className="mt-6 border-t border-stone-100 pt-5"><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Organized by</p><p className="mt-2 font-semibold text-stone-900">{campaign.organizer?.name || 'Community organizer'}</p><p className="mt-1 text-sm text-stone-500">{campaign.organizer?.location || campaign.location}</p></div>
      </aside>
    </div>
    {related.length > 0 && <div className="mt-16"><SectionHeading eyebrow="Keep exploring" title="Related campaigns" /><div className="grid gap-6 md:grid-cols-3">{related.map((item) => <CampaignCard key={item._id} campaign={item} />)}</div></div>}
  </div></div>;
}

export function AboutPage() {
  return <div className="section-pad"><div className="container-shell">
    <div className="mx-auto max-w-3xl text-center"><p className="eyebrow justify-center"><HeartHandshake size={15} /> Why SocialCause</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">A little more together.</h1><p className="mt-6 text-lg leading-8 text-stone-600">We believe every community holds the people and ideas it needs to thrive. SocialCause makes it easier to find each other—and do something good.</p></div>
    <img src={photos.education} alt="A community learning together" className="mt-12 h-[360px] w-full rounded-[2rem] object-cover sm:h-[470px]" />
    <div className="mx-auto mt-14 grid max-w-5xl gap-10 md:grid-cols-2"><div><h2 className="text-2xl font-bold">Our purpose</h2><p className="mt-4 leading-7 text-stone-600">Social impact can feel far away when you don't know where to begin. We bring local campaigns, volunteers, and community voices into one welcoming place—so a good intention can become a real contribution.</p></div><div><h2 className="text-2xl font-bold">How we work</h2><p className="mt-4 leading-7 text-stone-600">People and organizations can share causes, invite neighbors to volunteer, and learn from one another. We center community-led action across education, the environment, health, livelihoods, and more.</p></div></div>
    <div className="mt-14 rounded-[2rem] bg-forest-50 p-8 text-center sm:p-12"><h2 className="text-3xl font-bold text-forest-900">Good change is a team effort.</h2><p className="mx-auto mt-3 max-w-xl text-stone-600">Bring your time, your skills, your story—or simply your curiosity. There is room for you here.</p><Link to="/campaigns" className="button-primary mt-6">Find your cause <ArrowRight size={17} /></Link></div>
  </div></div>;
}

export function ContactPage() {
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const { data } = await api.post('/contact', Object.fromEntries(form));
      toast.success(data.message); formElement.reset();
    } catch (error) { toast.error(error.message); }
    finally { setBusy(false); }
  }
  return <section className="section-pad bg-sand"><div className="container-shell grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
    <div><p className="eyebrow"><MessageCircle size={15} /> We're listening</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-900">Let's talk about making a difference.</h1><p className="mt-5 leading-7 text-stone-600">Have a question, an idea, or a campaign you'd like to share? Send us a note and our community team will review your message.</p><div className="mt-8 rounded-2xl bg-white p-5 text-sm leading-6 text-stone-600"><ShieldCheck className="mb-2 text-forest-600" />Your message is securely stored for our team to review. This form does not send email automatically.</div></div>
    <form onSubmit={submit} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="field-label">Your name<input required minLength="2" maxLength="80" name="name" className="form-input mt-2" /></label><label className="field-label">Email address<input required type="email" name="email" className="form-input mt-2" /></label></div><label className="field-label mt-5 block">Subject<input required minLength="3" maxLength="140" name="subject" className="form-input mt-2" /></label><label className="field-label mt-5 block">Message<textarea required minLength="10" maxLength="3000" rows="6" name="message" className="form-input mt-2 resize-y" /></label><button disabled={busy} className="button-primary mt-6 w-full"><Send size={16} />{busy ? 'Sending...' : 'Send message'}</button></form>
  </div></section>;
}

export function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form);
    if (isRegister && values.password !== values.confirmPassword) { setError('Passwords do not match.'); setBusy(false); return; }
    try {
      const user = isRegister ? await register({ name: values.name, email: values.email, password: values.password }) : await login({ email: values.email, password: values.password });
      toast.success(isRegister ? 'Welcome to the community!' : 'Welcome back.');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  return <section className="section-pad bg-sand"><div className="mx-auto max-w-md"><div className="mb-7 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-forest-600 text-white"><HeartHandshake /></div><h1 className="mt-5 text-3xl font-bold text-stone-900">{isRegister ? 'Join the community' : 'Welcome back'}</h1><p className="mt-2 text-stone-500">{isRegister ? 'Your next good thing starts here.' : 'Sign in to continue your impact.'}</p></div>
    <form onSubmit={submit} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">{error && <ErrorState>{error}</ErrorState>}
      {isRegister && <label className="field-label mb-4 block">Full name<input required minLength="2" maxLength="80" autoComplete="name" name="name" className="form-input mt-2" /></label>}
      <label className="field-label mb-4 block">Email address<input required type="email" autoComplete="email" name="email" className="form-input mt-2" /></label>
      <label className="field-label mb-4 block">Password<input required minLength="8" maxLength="128" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} name="password" className="form-input mt-2" /></label>
      {isRegister && <label className="field-label mb-4 block">Confirm password<input required minLength="8" type="password" autoComplete="new-password" name="confirmPassword" className="form-input mt-2" /></label>}
      <button disabled={busy} className="button-primary mt-2 w-full">{busy ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}</button>
      <p className="mt-5 text-center text-sm text-stone-500">{isRegister ? 'Already have an account?' : 'New to SocialCause?'} <Link className="font-semibold text-forest-700" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
    </form></div></section>;
}

export function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [editingPost, setEditingPost] = useState(null);
  useEffect(() => { api.get('/posts?limit=30').then(({ data }) => setPosts(data.data.posts)).catch((reason) => setError(reason.message)).finally(() => setLoading(false)); }, [refresh]);
  async function createPost(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try { await api.post('/posts', Object.fromEntries(form)); formElement.reset(); toast.success('Your story is live.'); setRefresh((value) => value + 1); }
    catch (reason) { toast.error(reason.message); }
  }
  async function like(post) {
    if (!user) return toast.error('Sign in to support a story.');
    const alreadyLiked = post.likes?.includes(user._id);
    try { await api.request({ url: `/posts/${post._id}/like`, method: alreadyLiked ? 'DELETE' : 'POST' }); setRefresh((value) => value + 1); }
    catch (reason) { toast.error(reason.message); }
  }
  async function savePost(event, postId) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api.patch(`/posts/${postId}`, values);
      setEditingPost(null);
      toast.success('Story updated.');
      setRefresh((value) => value + 1);
    } catch (reason) { toast.error(reason.message); }
  }
  async function comment(event, postId) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const content = new FormData(formElement).get('content');
    try { await api.post(`/posts/${postId}/comments`, { content }); formElement.reset(); toast.success('Comment added.'); setRefresh((value) => value + 1); }
    catch (reason) { toast.error(reason.message); }
  }
  return <section className="section-pad bg-sand min-h-[70vh]"><div className="container-shell max-w-4xl"><div className="mb-9"><p className="eyebrow"><Heart size={15} /> Stories from the community</p><h1 className="mt-3 text-4xl font-bold tracking-tight">A community that cares.</h1><p className="mt-3 text-stone-600">Share what inspires you, celebrate local action, and learn from your neighbors.</p></div>
    {user && <form onSubmit={createPost} className="mb-7 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Share an awareness story</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input required minLength="4" maxLength="140" name="title" placeholder="Give your story a title" className="form-input" /><select name="category" required className="form-input">{categories.map((category) => <option key={category}>{category}</option>)}</select></div><textarea required minLength="10" maxLength="5000" rows="3" name="content" placeholder="What would you like the community to know?" className="form-input mt-3" /><input name="image" type="url" placeholder="Image URL (optional)" className="form-input mt-3" /><button className="button-primary mt-3"><Plus size={17} /> Publish story</button></form>}
    {loading ? <Loading /> : error ? <ErrorState>{error}</ErrorState> : posts.length ? <div className="grid gap-5">{posts.map((post) => <article key={post._id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">{post.category}</span><h2 className="mt-3 text-xl font-bold text-stone-900">{post.title}</h2><p className="mt-1 text-xs text-stone-500">By {post.author?.name || 'Community member'} · {new Date(post.createdAt).toLocaleDateString()}</p></div>{user?._id === post.author?._id && <div className="flex gap-3"><button onClick={() => setEditingPost(editingPost === post._id ? null : post._id)} className="text-xs font-semibold text-forest-700">{editingPost === post._id ? 'Cancel edit' : 'Edit story'}</button><button title="Delete post" onClick={async () => { try { await api.delete(`/posts/${post._id}`); toast.success('Story deleted.'); setRefresh((value) => value + 1); } catch (reason) { toast.error(reason.message); } }} className="text-stone-400 hover:text-red-600"><Trash2 size={17} /></button></div>}</div>
        {editingPost === post._id ? <form onSubmit={(event) => savePost(event, post._id)} className="mt-5 grid gap-3"><input required minLength="4" maxLength="140" name="title" aria-label="Story title" defaultValue={post.title} className="form-input" /><select name="category" aria-label="Story cause" defaultValue={post.category} className="form-input">{categories.map((category) => <option key={category}>{category}</option>)}</select><textarea required minLength="10" maxLength="5000" name="content" aria-label="Story content" rows="5" defaultValue={post.content} className="form-input" /><input name="image" type="url" aria-label="Story image URL" defaultValue={post.image} className="form-input" /><button className="button-primary w-fit">Save story</button></form> : <>{post.image && <img src={post.image} alt="" className="mt-5 max-h-80 w-full rounded-2xl object-cover" />}<p className="mt-4 whitespace-pre-line leading-7 text-stone-600">{post.content}</p></>}
        <div className="mt-5 flex items-center gap-4 border-t border-stone-100 pt-4"><button onClick={() => like(post)} className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-rose-600"><Heart size={17} className={post.likes?.includes(user?._id) ? 'fill-rose-500 text-rose-500' : ''} />{post.likes?.length || 0} appreciate</button><span className="inline-flex items-center gap-2 text-sm text-stone-500"><MessageCircle size={17} />{post.comments?.length || 0} comments</span>{user && <button onClick={async () => { try { await api.post(`/posts/${post._id}/report`); toast.success('Thanks, our moderation team will review this.'); } catch (reason) { toast.error(reason.message); } }} className="ml-auto text-xs font-semibold text-stone-400 hover:text-rose-600">Report</button>}</div>
        {post.comments?.length > 0 && <div className="mt-4 grid gap-3">{post.comments.map((item) => <div key={item._id} className="rounded-xl bg-sand px-4 py-3"><div className="flex justify-between gap-2"><p className="text-xs font-semibold text-stone-700">{item.author?.name || 'Community member'}</p>{(user?._id === item.author?._id || user?.role === 'admin') && <button aria-label="Delete comment" onClick={async () => { try { await api.delete(`/comments/${item._id}`); toast.success('Comment deleted.'); setRefresh((value) => value + 1); } catch (reason) { toast.error(reason.message); } }} className="text-stone-400 hover:text-red-600"><Trash2 size={14} /></button>}</div><p className="mt-1 text-sm text-stone-600">{item.content}</p></div>)}</div>}
        {user && <form onSubmit={(event) => comment(event, post._id)} className="mt-4 flex gap-2"><input required maxLength="1000" name="content" placeholder="Add a thoughtful comment..." className="form-input" /><button aria-label="Submit comment" className="button-primary !px-4"><Send size={17} /></button></form>}
      </article>)}</div> : <EmptyState title="The conversation starts here" description="Check back soon for community stories, or sign in to share one." action={!user && <Link to="/login" className="button-primary">Sign in to share</Link>} />}
  </div></section>;
}

export function DashboardPage() {
  const { user, setUser } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [busy, setBusy] = useState(false);
  const [volunteerLists, setVolunteerLists] = useState({});
  const [reload, setReload] = useState(0);
  useEffect(() => { Promise.all([api.get('/campaigns/mine'), api.get('/volunteers/mine'), api.get('/posts/mine')])
    .then(([a, b, c]) => { setCampaigns(a.data.data.campaigns); setRegistrations(b.data.data.registrations); setPosts(c.data.data.posts); })
    .catch((reason) => setError(reason.message)); }, [reload]);
  async function createCampaign(event) {
    event.preventDefault(); setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    values.volunteerCapacity = Number(values.volunteerCapacity);
    values.goals = values.goals.split('\n').map((value) => value.trim()).filter(Boolean);
    try { await api.post('/campaigns', values); toast.success('Campaign created as a draft.'); setShowForm(false); setReload((value) => value + 1); }
    catch (reason) { toast.error(reason.message); }
    finally { setBusy(false); }
  }
  async function updateProfile(event) {
    event.preventDefault();
    try { const { data } = await api.patch('/auth/profile', Object.fromEntries(new FormData(event.currentTarget))); setUser(data.data.user); toast.success('Profile updated.'); }
    catch (reason) { toast.error(reason.message); }
  }
  async function toggleVolunteers(campaignId) {
    if (volunteerLists[campaignId]) {
      setVolunteerLists((current) => ({ ...current, [campaignId]: null }));
      return;
    }
    try {
      const { data } = await api.get(`/campaigns/${campaignId}/volunteers`);
      setVolunteerLists((current) => ({ ...current, [campaignId]: data.data.registrations }));
    } catch (reason) { toast.error(reason.message); }
  }
  return <section className="section-pad bg-sand min-h-[70vh]"><div className="container-shell"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow"><Users size={15} /> Your impact space</p><h1 className="mt-3 text-4xl font-bold">Hello, {user.name.split(' ')[0]}.</h1><p className="mt-2 text-stone-600">Keep track of the good you are doing.</p></div><button onClick={() => setShowForm(!showForm)} className="button-primary"><Plus size={17} /> Create a campaign</button></div>
    {error && <div className="mt-6"><ErrorState>{error}</ErrorState></div>}
    <div className="mt-8 grid gap-4 sm:grid-cols-3">{[['My campaigns', campaigns.length], ['Volunteer activities', registrations.filter((item) => item.status === 'registered').length], ['My stories', posts.length]].map(([label, value]) => <div key={label} className="rounded-2xl border border-stone-200 bg-white p-5"><p className="text-3xl font-bold text-forest-700">{value}</p><p className="mt-1 text-sm text-stone-500">{label}</p></div>)}</div>
    {showForm && <form onSubmit={createCampaign} className="mt-7 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Start a community campaign</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="field-label">Campaign title<input required minLength="5" name="title" className="form-input mt-2" /></label><label className="field-label">Cause<select name="category" className="form-input mt-2">{categories.map((value) => <option key={value}>{value}</option>)}</select></label><label className="field-label sm:col-span-2">Short description<input required minLength="10" maxLength="240" name="shortDescription" className="form-input mt-2" /></label><label className="field-label sm:col-span-2">Full description<textarea required minLength="20" rows="4" name="description" className="form-input mt-2" /></label><label className="field-label">Location<input required name="location" className="form-input mt-2" /></label><label className="field-label">Image URL (optional)<input type="url" name="image" className="form-input mt-2" /></label><label className="field-label">Start date<input required type="date" name="startDate" className="form-input mt-2" /></label><label className="field-label">End date<input required type="date" name="endDate" className="form-input mt-2" /></label><label className="field-label">Volunteer capacity<input required type="number" min="1" max="100000" name="volunteerCapacity" className="form-input mt-2" /></label><label className="field-label">Goals (one per line)<textarea rows="2" name="goals" className="form-input mt-2" /></label></div><div className="mt-5 flex gap-3"><button disabled={busy} className="button-primary">{busy ? 'Creating...' : 'Save as draft'}</button><button type="button" onClick={() => setShowForm(false)} className="button-outline">Cancel</button></div></form>}
    <div className="mt-10 grid gap-8 lg:grid-cols-2"><div><h2 className="mb-4 text-xl font-bold">Campaigns I organize</h2>{campaigns.length ? <div className="grid gap-3">{campaigns.map((campaign) => <div key={campaign._id} className="rounded-2xl bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><Link to={`/campaigns/${campaign._id}`} className="font-semibold hover:text-forest-700">{campaign.title}</Link><p className="mt-1 text-xs capitalize text-stone-500">{campaign.status} · {campaign.volunteerCount} volunteers</p></div><div className="flex gap-2"><select aria-label={`Update status for ${campaign.title}`} value={campaign.status} onChange={async (event) => { try { await api.patch(`/campaigns/${campaign._id}`, { status: event.target.value }); toast.success('Campaign status updated.'); setReload((value) => value + 1); } catch (reason) { toast.error(reason.message); } }} className="form-input w-auto !py-2 text-xs">{({ draft: ['draft', 'active', 'cancelled'], active: ['active', 'completed', 'cancelled'], completed: ['completed'], cancelled: ['cancelled'] })[campaign.status].map((status) => <option key={status}>{status}</option>)}</select><button onClick={() => setEditingCampaign(editingCampaign?._id === campaign._id ? null : campaign)} className="button-outline !px-3 !py-2 text-xs">Edit details</button></div></div>{editingCampaign?._id === campaign._id && <CampaignEditor campaign={campaign} onClose={() => setEditingCampaign(null)} onSaved={() => { setEditingCampaign(null); setReload((value) => value + 1); }} />}<button onClick={() => toggleVolunteers(campaign._id)} className="mt-3 text-xs font-semibold text-forest-700">{volunteerLists[campaign._id] ? 'Hide volunteers' : 'View volunteers'}</button>{volunteerLists[campaign._id] && <div className="mt-3 grid gap-2 border-t border-stone-100 pt-3">{volunteerLists[campaign._id].length ? volunteerLists[campaign._id].map((item) => <div key={item._id} className="flex justify-between text-sm"><span>{item.user?.name}</span><span className="text-stone-500">{item.user?.email}</span></div>) : <p className="text-sm text-stone-500">No active volunteer registrations yet.</p>}</div>}</div>)}</div> : <EmptyState title="No campaigns yet" description="Bring an idea to life and invite your neighbors to join." />}</div>
      <div><h2 className="mb-4 text-xl font-bold">My volunteer activities</h2>{registrations.length ? <div className="grid gap-3">{registrations.map((registration) => <div key={registration._id} className="rounded-2xl bg-white p-4"><Link to={`/campaigns/${registration.campaign?._id}`} className="font-semibold hover:text-forest-700">{registration.campaign?.title || 'Campaign unavailable'}</Link><p className="mt-1 text-xs capitalize text-stone-500">{registration.status}</p></div>)}</div> : <EmptyState title="Your next good thing is waiting" description="Find a cause you care about and lend a hand." action={<Link to="/campaigns" className="button-outline">Explore campaigns</Link>} />}</div></div>
    <div className="mt-10"><h2 className="mb-4 text-xl font-bold">My awareness stories</h2>{posts.length ? <div className="grid gap-3 sm:grid-cols-2">{posts.map((post) => <div key={post._id} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4"><div><Link to="/community" className="font-semibold hover:text-forest-700">{post.title}</Link><p className="mt-1 text-xs capitalize text-stone-500">{post.moderationStatus} · {post.category}</p></div><button aria-label={`Delete ${post.title}`} onClick={async () => { try { await api.delete(`/posts/${post._id}`); toast.success('Story deleted.'); setReload((value) => value + 1); } catch (reason) { toast.error(reason.message); } }} className="text-stone-400 hover:text-red-600"><Trash2 size={17} /></button></div>)}</div> : <EmptyState title="No stories shared yet" description="Share an awareness story with your community." action={<Link to="/community" className="button-outline">Visit the community</Link>} />}</div>
    <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-6"><h2 className="text-xl font-bold">Account settings</h2><form onSubmit={updateProfile} className="mt-5 grid gap-4 sm:grid-cols-3"><label className="field-label">Name<input defaultValue={user.name} name="name" required minLength="2" className="form-input mt-2" /></label><label className="field-label">Location<input defaultValue={user.location} name="location" className="form-input mt-2" /></label><label className="field-label">Bio<input defaultValue={user.bio} name="bio" maxLength="500" className="form-input mt-2" /></label><button className="button-outline sm:col-span-3 sm:w-fit">Save profile</button></form>
      <PasswordForm />
    </div>
  </div></section>;
}

function CampaignEditor({ campaign, onClose, onSaved }) {
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    values.volunteerCapacity = Number(values.volunteerCapacity);
    values.goals = values.goals.split('\n').map((goal) => goal.trim()).filter(Boolean);
    setBusy(true);
    try {
      await api.patch(`/campaigns/${campaign._id}`, values);
      toast.success('Campaign details updated.');
      onSaved();
    } catch (error) { toast.error(error.message); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-4 grid gap-3 rounded-xl border border-stone-100 bg-sand p-4 sm:grid-cols-2">
    <input required minLength="5" maxLength="120" name="title" aria-label="Campaign title" defaultValue={campaign.title} className="form-input" />
    <select name="category" aria-label="Campaign cause" defaultValue={campaign.category} className="form-input">{categories.map((category) => <option key={category}>{category}</option>)}</select>
    <input required minLength="10" maxLength="240" name="shortDescription" aria-label="Short description" defaultValue={campaign.shortDescription} className="form-input sm:col-span-2" />
    <textarea required minLength="20" maxLength="6000" rows="4" name="description" aria-label="Campaign description" defaultValue={campaign.description} className="form-input sm:col-span-2" />
    <input required name="location" aria-label="Campaign location" defaultValue={campaign.location} className="form-input" />
    <input type="url" name="image" aria-label="Campaign image URL" defaultValue={campaign.image} className="form-input" />
    <input required type="date" name="startDate" aria-label="Campaign start date" defaultValue={new Date(campaign.startDate).toISOString().slice(0, 10)} className="form-input" />
    <input required type="date" name="endDate" aria-label="Campaign end date" defaultValue={new Date(campaign.endDate).toISOString().slice(0, 10)} className="form-input" />
    <input required type="number" min={campaign.volunteerCount} max="100000" name="volunteerCapacity" aria-label="Volunteer capacity" defaultValue={campaign.volunteerCapacity} className="form-input" />
    <textarea rows="2" name="goals" aria-label="Campaign goals" defaultValue={campaign.goals?.join('\n')} className="form-input" />
    <div className="flex gap-2 sm:col-span-2"><button disabled={busy} className="button-primary !py-2">{busy ? 'Saving...' : 'Save changes'}</button><button type="button" onClick={onClose} className="button-outline !py-2">Cancel</button></div>
  </form>;
}

function PasswordForm() {
  async function change(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try { await api.patch('/auth/password', values); toast.success('Password updated.'); form.reset(); }
    catch (error) { toast.error(error.message); }
  }
  return <form onSubmit={change} className="mt-8 border-t border-stone-100 pt-6"><h3 className="font-semibold">Change password</h3><div className="mt-4 grid gap-3 sm:grid-cols-3"><input required type="password" minLength="8" name="currentPassword" placeholder="Current password" className="form-input" /><input required type="password" minLength="8" name="newPassword" placeholder="New password (8+ characters)" className="form-input" /><button className="button-outline">Update password</button></div></form>;
}

export function AdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/posts/pending'), api.get('/admin/users?limit=20'), api.get('/admin/campaigns?limit=50')])
      .then(([stats, pending, userList, campaignList]) => { setData(stats.data.data); setPosts(pending.data.data.posts); setUsers(userList.data.data.users); setCampaigns(campaignList.data.data.campaigns); })
      .catch((reason) => setError(reason.message));
  }, [reload]);
  async function moderate(id, status) {
    try { await api.patch(`/admin/posts/${id}/moderation`, { status }); toast.success(`Post ${status}.`); setReload((value) => value + 1); }
    catch (reason) { toast.error(reason.message); }
  }
  async function setCampaignStatus(id, status) {
    try { await api.patch(`/admin/campaigns/${id}/status`, { status }); toast.success('Campaign status updated.'); setReload((value) => value + 1); }
    catch (reason) { toast.error(reason.message); }
  }
  return <section className="section-pad bg-sand min-h-[70vh]"><div className="container-shell"><p className="eyebrow"><ShieldCheck size={15} /> Community stewardship</p><h1 className="mt-3 text-4xl font-bold">Admin dashboard</h1>{error && <div className="mt-6"><ErrorState>{error}</ErrorState></div>}
    {!data ? <Loading /> : <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{Object.entries(data.stats).map(([key, value]) => <div key={key} className="rounded-2xl border border-stone-200 bg-white p-5"><p className="text-3xl font-bold text-forest-700">{value}</p><p className="mt-1 text-sm capitalize text-stone-500">{key.replace(/([A-Z])/g, ' $1')}</p></div>)}</div>
      <div className="mt-8 grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="font-bold">Recent campaigns</h2>{data.recent.campaigns.length ? <div className="mt-3 grid gap-3">{data.recent.campaigns.map((campaign) => <Link key={campaign._id} to={`/campaigns/${campaign._id}`} className="flex justify-between gap-3 text-sm"><span className="font-medium text-stone-700">{campaign.title}</span><span className="text-xs capitalize text-stone-500">{campaign.status}</span></Link>)}</div> : <p className="mt-3 text-sm text-stone-500">No campaign activity yet.</p>}</div><div className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="font-bold">Recent reported stories</h2>{data.recent.posts.length ? <div className="mt-3 grid gap-3">{data.recent.posts.map((post) => <Link key={post._id} to="/community" className="flex justify-between gap-3 text-sm"><span className="font-medium text-stone-700">{post.title}</span><span className="text-xs text-stone-500">{new Date(post.createdAt).toLocaleDateString()}</span></Link>)}</div> : <p className="mt-3 text-sm text-stone-500">No recent reported stories.</p>}</div></div>
      <div className="mt-9 grid gap-8 lg:grid-cols-2"><div><h2 className="mb-4 text-xl font-bold">Posts awaiting moderation ({posts.length})</h2>{posts.length ? posts.map((post) => <article key={post._id} className="mb-3 rounded-2xl bg-white p-5"><p className="font-semibold">{post.title}</p><p className="mt-1 text-sm text-stone-600">{post.content}</p><p className="mt-2 text-xs text-stone-500">By {post.author?.name}</p><div className="mt-4 flex gap-2"><button onClick={() => moderate(post._id, 'approved')} className="button-primary !px-4 !py-2">Approve</button><button onClick={() => moderate(post._id, 'rejected')} className="button-outline !px-4 !py-2">Reject</button></div></article>) : <EmptyState title="All caught up" description="There are no posts waiting for review." />}</div>
        <div><h2 className="mb-4 text-xl font-bold">Community members</h2><div className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="divide-y divide-stone-100">{users.map((person) => <div key={person._id} className="flex items-center justify-between gap-3 p-4"><div><p className="font-semibold">{person.name}</p><p className="text-xs text-stone-500">{person.email}</p></div><select aria-label={`Role for ${person.name}`} value={person.role} disabled={person._id === user?._id} onChange={async (event) => { try { await api.patch(`/admin/users/${person._id}/role`, { role: event.target.value }); toast.success('Role updated.'); setReload((value) => value + 1); } catch (reason) { toast.error(reason.message); } }} className="form-input w-auto !py-2 text-xs"><option value="user">User</option><option value="admin">Admin</option></select></div>)}</div></div></div></div>
      <div className="mt-9"><h2 className="mb-4 text-xl font-bold">Campaign management</h2><div className="grid gap-3 md:grid-cols-2">{campaigns.map((campaign) => <div key={campaign._id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4"><div><Link to={`/campaigns/${campaign._id}`} className="font-semibold hover:text-forest-700">{campaign.title}</Link><p className="mt-1 text-xs text-stone-500">By {campaign.organizer?.name} · {campaign.volunteerCount} volunteers</p></div><select aria-label={`Campaign status for ${campaign.title}`} value={campaign.status} onChange={(event) => setCampaignStatus(campaign._id, event.target.value)} className="form-input w-auto !py-2 text-xs">{({ draft: ['draft', 'active', 'cancelled'], active: ['active', 'completed', 'cancelled'], completed: ['completed'], cancelled: ['cancelled'] })[campaign.status].map((status) => <option key={status}>{status}</option>)}</select></div>)}</div></div>
    </>}
  </div></section>;
}
