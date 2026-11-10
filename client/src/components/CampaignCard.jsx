import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowUpRight, Leaf } from 'lucide-react';

const fallback = 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1000&q=80';
export function CampaignCard({ campaign }) {
  return (
    <article className="card group overflow-hidden">
      <Link to={`/campaigns/${campaign._id}`} className="relative block h-52 overflow-hidden bg-forest-50">
        <img src={campaign.image || fallback} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-forest-700">{campaign.category}</span>
        <span className="absolute right-4 top-4 rounded-full bg-forest-700 px-3 py-1.5 text-xs font-semibold capitalize text-white">{campaign.status}</span>
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500"><MapPin size={14} />{campaign.location}</div>
        <Link to={`/campaigns/${campaign._id}`}><h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-stone-900 hover:text-forest-700">{campaign.title}</h3></Link>
        <p className="mt-1 text-xs text-stone-500">Organized by {campaign.organizer?.name || 'Community members'}</p>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-stone-600">{campaign.shortDescription}</p>
        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-stone-500"><Users size={15} />{campaign.volunteerCount || 0} joined</span>
          <Link to={`/campaigns/${campaign._id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700">Learn more <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </article>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div><p className="eyebrow"><Leaf size={14} />{eyebrow}</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{title}</h2>{description && <p className="mt-3 max-w-2xl text-stone-600">{description}</p>}</div>
    {action}
  </div>;
}
