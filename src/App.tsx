import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDownUp, ArrowLeft, ArrowRight, Bath, BedDouble, Check, ChevronDown, ChevronLeft,
  ChevronRight, Clock, Filter, Heart, Home, LayoutDashboard, ListFilter, MapPin, Menu,
  Minus, Plus, Search, SlidersHorizontal, Square, Trash2, X, CalendarDays, Phone,
  Mail, ShieldCheck, Sparkles, Building2, Users, TrendingUp, Pencil, Eye, MessageSquare,
  Star, CheckCircle2, CircleHelp, LogOut, ImagePlus, Sun, Moon
} from "lucide-react";
import { initialProperties, type Property, type PropertyStatus, type PropertyType } from "./data";
import { adminLogout, isAdminAuthenticated } from "./auth";
import AdminLogin from "./AdminLogin";
import AiAssistant from "./AiAssistant";

const STORAGE = "haven-marketplace-v2";
type Inquiry = { id: string; propertyId: string; name: string; email: string; phone: string; message: string; date: string; time: string; createdAt: string; status: "New" | "Contacted" | "Completed" };
const money = (n: number, listing: string) => listing === "Rent" ? `PKR ${n.toLocaleString("en-PK")}/mo` : `PKR ${(n / 1000000).toFixed(2)}M`;
const areaLabel = (n: number) => `${n.toLocaleString()} sq ft`;
const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const writeStore = (value: unknown) => { try { localStorage.setItem(STORAGE, JSON.stringify(value)); } catch { /* storage can be unavailable in private browsing */ } };

const CONTACT_EMAIL = "bashirahmad7576@gmail.com";
// Delivers website messages to CONTACT_EMAIL via FormSubmit (free, no backend/key).
const sendEmail = async (data: Record<string, string>) => {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: "Aura Estates — new website message", _template: "table", _captcha: "false", ...data }),
    });
    return res.ok;
  } catch {
    return false;
  }
};

function useMarketplace() {
  const [properties, setProperties] = useState<Property[]>(() => readStore()?.properties ?? initialProperties);
  const [favorites, setFavorites] = useState<string[]>(() => readStore()?.favorites ?? []);
  const [compare, setCompare] = useState<string[]>(() => readStore()?.compare ?? []);
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => readStore()?.inquiries ?? []);
  const [activeProperty, setActiveProperty] = useState<string | null>(null);
  useEffect(() => writeStore({ properties, favorites, compare, inquiries }), [properties, favorites, compare, inquiries]);
  const addProperty = (p: Property) => setProperties(old => [p, ...old]);
  const updateProperty = (p: Property) => setProperties(old => old.map(x => x.id === p.id ? p : x));
  const deleteProperty = (id: string) => {
    setProperties(old => old.filter(p => p.id !== id));
    setFavorites(old => old.filter(x => x !== id));
    setCompare(old => old.filter(x => x !== id));
    setInquiries(old => old.filter(x => x.propertyId !== id));
    if (activeProperty === id) setActiveProperty(null);
  };
  const toggleFavorite = (id: string) => setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  const toggleCompare = (id: string) => setCompare(old => old.includes(id) ? old.filter(x => x !== id) : old.length >= 4 ? old : [...old, id]);
  const clearCompare = () => setCompare([]);
  const addInquiry = (item: Inquiry) => setInquiries(old => [item, ...old]);
  return { properties, setProperties, favorites, compare, inquiries, setInquiries, activeProperty, setActiveProperty, addProperty, updateProperty, deleteProperty, toggleFavorite, toggleCompare, clearCompare, addInquiry };
}
type Store = ReturnType<typeof useMarketplace>;
const amenities = ["Swimming pool", "Gym", "24/7 security", "Backup power", "Balcony", "Garden", "Parking", "CCTV", "Fitted kitchen", "Nearby parks", "Elevator", "Concierge", "Central heating", "Smart home", "Terrace", "Clubhouse", "Play area", "Water filtration", "Storage", "Walk-in closet"];

type Theme = "light" | "dark";
function ThemeToggle({ theme, onToggle, label = "Switch theme" }: { theme: Theme; onToggle: () => void; label?: string }) {
  return <button type="button" className="theme-toggle icon-btn" onClick={onToggle} aria-label={label} title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}><span className="theme-toggle-icon">{theme === "light" ? <Moon size={17}/> : <Sun size={17}/>}</span><span className="theme-toggle-label">{theme === "light" ? "Dark" : "Light"}</span></button>;
}

function Header({ store, theme, onToggleTheme, showAdmin }: { store: Store; theme: Theme; onToggleTheme: () => void; showAdmin: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header"><div className="nav-wrap">
    <Link to="/" className="brand"><span className="brand-mark"><Home size={19}/></span><span>Aura Estates<span className="brand-dot">.</span><small>PROPERTY COLLECTION</small></span></Link>
    <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Main navigation">
      <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
      <NavLink to="/properties" onClick={() => setMenuOpen(false)}>Explore homes</NavLink>
      <NavLink to="/about" onClick={() => setMenuOpen(false)}>Our story</NavLink>
      <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
    </nav>
    <div className="nav-actions"><ThemeToggle theme={theme} onToggle={onToggleTheme}/><Link className="saved-link" to="/favorites" aria-label={`Saved homes, ${store.favorites.length}`}><Heart size={17}/><span>Saved</span><b>{store.favorites.length}</b></Link>{showAdmin && <Link to="/admin" className="button button-dark nav-admin">Admin <ArrowRight size={15}/></Link>}<button className="mobile-menu icon-btn" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button></div>
  </div></header>;
}

function PropertyCard({ p, store }: { p: Property; store: Store }) {
  const [imgError, setImgError] = useState(false);
  return <article className="property-card">
    <div className="card-image-wrap">
      <Link to={`/property/${p.id}`} className="card-image-link" aria-label={`View ${p.title}`}><img src={imgError ? "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80" : p.images[0]} onError={() => setImgError(true)} alt={p.title} loading="lazy"/></Link>
      <span className="status-pill">{p.listing === "Rent" ? "For rent" : p.status === "Available" ? "For sale" : p.status}</span>
      {p.featured && <span className="featured-pill"><Sparkles size={12}/> Featured</span>}
      <button className={`favorite-btn ${store.favorites.includes(p.id) ? "is-favorite" : ""}`} onClick={() => store.toggleFavorite(p.id)} aria-label={store.favorites.includes(p.id) ? "Remove from favourites" : "Add to favourites"}><Heart size={18} fill={store.favorites.includes(p.id) ? "currentColor" : "none"}/></button>
    </div>
    <div className="property-card-body">
      <div className="card-price">{money(p.price, p.listing)}</div>
      <Link to={`/property/${p.id}`} className="card-title">{p.title}</Link>
      <div className="card-location"><MapPin size={14}/>{p.location}</div>
      <div className="property-specs"><span><BedDouble size={16}/>{p.bedrooms} beds</span><span><Bath size={16}/>{p.bathrooms} baths</span><span><Square size={15}/>{areaLabel(p.area)}</span></div>
      <div className="card-footer"><span>{p.type}</span><button className={`compare-mini ${store.compare.includes(p.id) ? "selected" : ""}`} onClick={() => store.toggleCompare(p.id)}>{store.compare.includes(p.id) ? <Check size={14}/> : <Plus size={14}/>} Compare</button></div>
    </div>
  </article>;
}

function SearchBar({ onSearch, initial = "" }: { onSearch: (value: string) => void; initial?: string }) {
  const [q, setQ] = useState(initial);
  return <form className="hero-search" onSubmit={e => { e.preventDefault(); onSearch(q); }}>
    <div className="search-input-wrap"><Search size={19}/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Neighbourhood, city, or property name" aria-label="Search properties"/></div>
    <button className="button button-dark" type="submit">Find a home <ArrowRight size={16}/></button>
  </form>;
}

function HomePage({ store }: { store: Store }) {
  const navigate = useNavigate();
  const [listing, setListing] = useState<"Buy" | "Rent">("Buy");
  const featured = store.properties.filter(p => p.featured && p.status === "Available").slice(0, 3);
  return <main>
    <section className="hero">
      <div className="hero-content"><div className="eyebrow light"><span/> A more considered way to find home</div>
        <h1>Find a place<br/>that feels like <em>home.</em></h1>
        <p>Discover thoughtfully selected homes, in the neighbourhoods you love, with guidance you can trust.</p>
        <div className="hero-tabs"><button className={listing === "Buy" ? "active" : ""} onClick={() => setListing("Buy")}>Buy a home</button><button className={listing === "Rent" ? "active" : ""} onClick={() => setListing("Rent")}>Rent a home</button></div>
        <SearchBar onSearch={q => navigate(`/properties?search=${encodeURIComponent(q)}&listing=${listing}`)}/>
        <div className="hero-note"><ShieldCheck size={16}/> Curated homes. Clear choices. A better move.</div>
      </div>
      <div className="hero-visual"><div className="hero-image-main"><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=90" alt="Modern architecture with warm natural materials"/></div><div className="hero-floating-card"><span className="floating-icon"><Home size={18}/></span><div><b>Spaces to settle into</b><small>Find your next chapter</small></div><ArrowUpRightFallback/></div><div className="hero-vertical-label">A PLACE TO BELONG — 2026</div></div>
    </section>
    <section className="trust-strip"><div><b>30+</b><span>Thoughtfully selected homes</span></div><div><b>10</b><span>Neighbourhoods to explore</span></div><div><b>One</b><span>Dedicated team by your side</span></div><div className="trust-last"><span className="avatar-stack"><i>AK</i><i>HM</i><i>SM</i></span><span>Local guidance, always</span></div></section>
    <section className="section container"><div className="section-heading"><div><div className="eyebrow"><span/> A considered collection</div><h2>Homes worth<br/><em>coming home to.</em></h2></div><Link className="text-link" to="/properties">Explore all properties <ArrowRight size={17}/></Link></div>
      <div className="property-grid">{featured.map(p => <PropertyCard key={p.id} p={p} store={store}/>)}</div>
    </section>
    <section className="editorial-band"><div className="editorial-image"><img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85" alt="Sunlit contemporary living room"/></div><div className="editorial-copy"><div className="eyebrow light"><span/> More than a property</div><h2>A home is a feeling.<br/><em>Let's find yours.</em></h2><p>We believe finding a home should feel less like a transaction and more like the beginning of something good. That's why every detail, from our collection to our guidance, is considered with you in mind.</p><Link className="button button-cream" to="/about">Get to know Aura Estates <ArrowRight size={16}/></Link></div></section>
    <section className="section container locations-section"><div className="section-heading"><div><div className="eyebrow"><span/> Find your corner</div><h2>Neighbourhoods with<br/><em>a little something.</em></h2></div><p className="section-intro">From leafy streets to lively city pockets, explore places that fit the way you want to live.</p></div><div className="location-grid">{[{name:"DHA, Lahore",sub:"Space to grow",img:"photo-1600585154340-be6161a56a0c"},{name:"Gulberg, Lahore",sub:"City at your doorstep",img:"photo-1600607687920-4e2a09cf159d"},{name:"Bahria Town",sub:"Room to breathe",img:"photo-1600566753190-17f0baa2a6c3"}].map(l => <button key={l.name} className="location-card" onClick={() => navigate(`/properties?search=${encodeURIComponent(l.name.split(",")[0])}`)}><img src={`https://images.unsplash.com/${l.img}?auto=format&fit=crop&w=700&q=80`} alt="Neighbourhood home"/><span><small>{l.sub}</small><b>{l.name}</b></span><ArrowRight size={18}/></button>)}</div></section>
    <section className="cta-section"><div><div className="eyebrow light"><span/> Your next chapter starts here</div><h2>Ready to find<br/><em>your place?</em></h2></div><Link className="button button-cream" to="/properties">Start exploring <ArrowRight size={16}/></Link></section>
  </main>;
}
function ArrowUpRightFallback() { return <ArrowRight className="floating-arrow" size={17}/>; }

function PropertiesPage({ store }: { store: Store }) {
  const [params] = [new URLSearchParams(window.location.search)];
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [listing, setListing] = useState(params.get("listing") ?? "All");
  const [type, setType] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("Any");
  const [bathrooms, setBathrooms] = useState("Any");
  const [furnishing, setFurnishing] = useState("All");
  const [status, setStatus] = useState("Available");
  const [amenity, setAmenity] = useState("All");
  const [minArea, setMinArea] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const activeCount = [search, listing !== "All" ? listing : "", type !== "All" ? type : "", minPrice, maxPrice, bedrooms !== "Any" ? bedrooms : "", bathrooms !== "Any" ? bathrooms : "", furnishing !== "All" ? furnishing : "", status !== "All" ? status : "", amenity !== "All" ? amenity : "", minArea, featuredOnly ? "featured" : ""].filter(Boolean).length;
  const filtered = useMemo(() => {
    let result = store.properties.filter(p => {
      const q = search.trim().toLowerCase();
      return (!q || `${p.title} ${p.location} ${p.type}`.toLowerCase().includes(q)) &&
        (listing === "All" || p.listing === listing) &&
        (type === "All" || p.type === type) &&
        (!minPrice || p.price >= Number(minPrice)) &&
        (!maxPrice || p.price <= Number(maxPrice)) &&
        (bedrooms === "Any" || p.bedrooms >= Number(bedrooms)) &&
        (bathrooms === "Any" || p.bathrooms >= Number(bathrooms)) &&
        (furnishing === "All" || p.furnishing === furnishing) &&
        (status === "All" || p.status === status) &&
        (amenity === "All" || p.amenities.includes(amenity)) &&
        (!minArea || p.area >= Number(minArea)) &&
        (!featuredOnly || p.featured);
    });
    result = [...result].sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "area" ? b.area - a.area : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [store.properties, search, listing, type, minPrice, maxPrice, bedrooms, bathrooms, furnishing, status, amenity, minArea, sort, featuredOnly]);
  const clear = () => { setSearch(""); setListing("All"); setType("All"); setMinPrice(""); setMaxPrice(""); setBedrooms("Any"); setBathrooms("Any"); setFurnishing("All"); setStatus("All"); setAmenity("All"); setMinArea(""); setSort("newest"); setFeaturedOnly(false); };
  return <main className="page-main container"><div className="page-title-row"><div><div className="eyebrow"><span/> The Aura Estates collection</div><h1>Find your <em>place.</em></h1><p>Thoughtful spaces, selected for the way you want to live.</p></div><div className="catalogue-side-note"><span>{store.properties.length.toString().padStart(2, "0")}</span> homes in our collection</div></div>
    <div className="catalogue-toolbar"><div className="catalogue-search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search neighbourhood or property"/></div><button className={`button ${showFilters ? "button-dark" : "button-outline"}`} onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16}/> Filters {activeCount > 0 && <b className="filter-count">{activeCount}</b>}</button><label className="sort-control"><ArrowDownUp size={16}/><select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort properties"><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="area">Largest area</option></select></label></div>
    {showFilters && <div className="filters-panel">
      <div className="filter-field"><label>Listing type</label><select value={listing} onChange={e => setListing(e.target.value)}><option>All</option><option>Buy</option><option>Rent</option></select></div>
      <div className="filter-field"><label>Property type</label><select value={type} onChange={e => setType(e.target.value)}><option>All</option>{["House","Apartment","Villa","Townhouse","Penthouse"].map(x => <option key={x}>{x}</option>)}</select></div>
      <div className="filter-field"><label>Min. price (PKR)</label><input type="number" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="No minimum"/></div>
      <div className="filter-field"><label>Max. price (PKR)</label><input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="No maximum"/></div>
      <div className="filter-field"><label>Bedrooms</label><select value={bedrooms} onChange={e => setBedrooms(e.target.value)}>{["Any","1","2","3","4","5"].map(x => <option key={x}>{x}</option>)}</select></div>
      <div className="filter-field"><label>Bathrooms</label><select value={bathrooms} onChange={e => setBathrooms(e.target.value)}>{["Any","1","2","3","4"].map(x => <option key={x}>{x}</option>)}</select></div>
      <div className="filter-field"><label>Furnishing</label><select value={furnishing} onChange={e => setFurnishing(e.target.value)}><option>All</option><option>Furnished</option><option>Semi-furnished</option><option>Unfurnished</option></select></div>
      <div className="filter-field"><label>Status</label><select value={status} onChange={e => setStatus(e.target.value)}><option>All</option><option>Available</option><option>Sold</option><option>Rented</option></select></div>
      <div className="filter-field"><label>Minimum area (sq ft)</label><input type="number" min="0" value={minArea} onChange={e => setMinArea(e.target.value)} placeholder="Any size"/></div>
      <div className="filter-field"><label>Amenity</label><select value={amenity} onChange={e => setAmenity(e.target.value)}><option>All</option>{amenities.map(x => <option key={x}>{x}</option>)}</select></div>
      <label className="featured-filter"><input type="checkbox" checked={featuredOnly} onChange={e => setFeaturedOnly(e.target.checked)}/> Featured homes only</label>
      <button className="text-link clear-filters" onClick={clear}>Clear all filters <X size={14}/></button>
    </div>}
    <div className="result-bar"><span><b>{filtered.length}</b> {filtered.length === 1 ? "property" : "properties"} found</span><div className="active-chips">{search && <button onClick={() => setSearch("")}>{search} <X size={12}/></button>}{type !== "All" && <button onClick={() => setType("All")}>{type} <X size={12}/></button>}{listing !== "All" && <button onClick={() => setListing("All")}>{listing} <X size={12}/></button>}{(activeCount > 0) && <button className="clear-chip" onClick={clear}>Clear all</button>}</div></div>
    {filtered.length ? <div className="property-grid catalogue-grid">{filtered.map(p => <PropertyCard key={p.id} p={p} store={store}/>)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={24}/></span><h3>No homes found just yet.</h3><p>Try adjusting your search or clearing a few filters to discover more homes.</p><button className="button button-dark" onClick={clear}>Clear all filters</button></div>}
  </main>;
}

function PropertyDetail({ store }: { store: Store }) {
  const { id } = useParams();
  const p = store.properties.find(x => x.id === id);
  const [photo, setPhoto] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "I'd love to know more about this property.", date: "", time: "" });
  const [formError, setFormError] = useState("");
  const [dateSlots, setDateSlots] = useState(["10:00 AM", "12:30 PM", "03:00 PM", "05:00 PM"]);
  useEffect(() => {
    if (!form.date) return;
    const weekday = new Date(`${form.date}T12:00:00`).getDay();
    setDateSlots(weekday === 0 ? ["11:00 AM", "01:30 PM"] : weekday === 6 ? ["10:00 AM", "12:00 PM", "02:00 PM"] : ["10:00 AM", "12:30 PM", "03:00 PM", "05:00 PM"]);
    setForm(old => ({ ...old, time: "" }));
  }, [form.date]);
  if (!p) return <main className="container page-main"><div className="empty-state"><h2>We couldn't find that property.</h2><p>It may have been removed or the link may be out of date.</p><Link className="button button-dark" to="/properties">Back to properties</Link></div></main>;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.phone.trim()) { setFormError("Enter your name, a valid email, and a phone number."); return; }
    if (bookingOpen && (!form.date || !form.time || new Date(`${form.date}T00:00:00`) < new Date(new Date().toDateString()))) { setFormError("Choose a valid future date and one of the available time slots."); return; }
    store.addInquiry({ id: `IN-${Date.now()}`, propertyId: p.id, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), message: form.message.trim(), date: bookingOpen ? form.date : "", time: bookingOpen ? form.time : "", createdAt: new Date().toISOString(), status: "New" });
    void sendEmail({ Type: bookingOpen ? "Viewing request" : "Property inquiry", Property: `${p.title} (${p.id})`, Price: money(p.price, p.listing), Name: form.name.trim(), Email: form.email.trim(), Phone: form.phone.trim(), Viewing: bookingOpen && form.date ? `${form.date} at ${form.time}` : "Not requested", Message: form.message.trim() });
    setInquirySent(true); setFormError("");
  };
  return <main className="container page-main detail-page"><Link to="/properties" className="back-link"><ArrowLeft size={16}/> Back to properties</Link>
    <div className="detail-heading"><div><div className="eyebrow"><span/> {p.type} · {p.listing === "Rent" ? "For rent" : "For sale"}</div><h1>{p.title}</h1><p><MapPin size={16}/>{p.location}</p></div><div className="detail-price">{money(p.price, p.listing)}<small>{p.status}</small></div></div>
    <div className="gallery-layout"><div className="gallery-main"><img src={p.images[photo]} alt={`${p.title}, image ${photo + 1}`}/><span className="gallery-counter">{photo + 1} / {p.images.length}</span><button className="gallery-arrow left" aria-label="Previous image" onClick={() => setPhoto((photo + p.images.length - 1) % p.images.length)}><ChevronLeft/></button><button className="gallery-arrow right" aria-label="Next image" onClick={() => setPhoto((photo + 1) % p.images.length)}><ChevronRight/></button></div><div className="gallery-thumbs">{p.images.map((img, i) => <button key={img} className={i === photo ? "active" : ""} onClick={() => setPhoto(i)}><img src={img} alt={`View ${i + 1}`}/></button>)}</div></div>
    <div className="detail-columns"><div className="detail-content"><div className="detail-specs"><div><BedDouble/><b>{p.bedrooms}</b><span>Bedrooms</span></div><div><Bath/><b>{p.bathrooms}</b><span>Bathrooms</span></div><div><Square/><b>{areaLabel(p.area)}</b><span>Area</span></div><div><Building2/><b>{p.parking}</b><span>Parking</span></div></div><section className="detail-section"><h2>About this home</h2><p>{p.description}</p><p>Set in {p.location}, this thoughtfully presented {p.type.toLowerCase()} combines everyday practicality with considered design. Reach out to our property team to arrange a personal visit or ask any questions.</p></section><section className="detail-section"><h2>Home details</h2><div className="details-table"><span>Property type</span><b>{p.type}</b><span>Listing</span><b>{p.listing}</b><span>Furnishing</span><b>{p.furnishing}</b><span>Year built</span><b>{p.yearBuilt}</b><span>Property ID</span><b>{p.id}</b><span>Status</span><b>{p.status}</b></div></section><section className="detail-section"><h2>Features & amenities</h2><div className="amenity-grid">{p.amenities.map(a => <span key={a}><Check size={15}/>{a}</span>)}</div></section></div>
      <aside className="agent-card"><div className="agent-top"><div className="agent-avatar">{p.agent.name.split(" ").map(n => n[0]).join("")}</div><div><small>YOUR PROPERTY CONTACT</small><h3>{p.agent.name}</h3><span>{p.agent.role}</span></div></div><div className="agent-contact"><span><Phone size={15}/>{p.agent.phone}</span><span><Mail size={15}/>{p.agent.email}</span></div>{inquirySent ? <div className="success-message"><CheckCircle2 size={20}/><b>Request received</b><p>Thank you. Our property team will be in touch.</p><button className="button button-outline" onClick={() => {setInquirySent(false); setBookingOpen(false);}}>Send another request</button></div> : <form className="inquiry-form" onSubmit={submit}><h3>{bookingOpen ? "Request a viewing" : "Interested in this home?"}</h3><p>{bookingOpen ? "Choose a convenient time to visit." : "Leave a few details and we'll be in touch."}</p>{bookingOpen && <><label>Preferred date<input required type="date" min={new Date().toISOString().slice(0,10)} value={form.date} onChange={e => setForm({...form,date:e.target.value})}/></label><label>Available time<select required value={form.time} onChange={e => setForm({...form,time:e.target.value})}><option value="">Choose a time</option>{dateSlots.map(s => <option key={s}>{s}</option>)}</select></label></>}<label>Your name<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Full name"/></label><label>Email address<input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Phone number<input required type="tel" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="+92 3xx xxxxxxx"/></label><label>Message<textarea value={form.message} onChange={e => setForm({...form,message:e.target.value})} rows={3}/></label>{formError && <p className="form-error">{formError}</p>}<button className="button button-dark full-width" type="submit">{bookingOpen ? "Confirm viewing request" : "Send inquiry"} <ArrowRight size={16}/></button>{!bookingOpen && <button className="button button-outline full-width" type="button" onClick={() => setBookingOpen(true)}><CalendarDays size={16}/> Schedule a viewing</button>}</form>}
      <div className="agent-card-bottom"><ShieldCheck size={15}/> Your details are handled with care.</div></aside>
    </div>
  </main>;
}

function FavoritesPage({ store }: { store: Store }) {
  const saved = store.properties.filter(p => store.favorites.includes(p.id));
  return <main className="container page-main"><div className="eyebrow"><span/> Kept close</div><div className="page-title-row"><div><h1>Your saved <em>homes.</em></h1><p>A shortlist of places you want to come back to.</p></div></div>{saved.length ? <div className="property-grid">{saved.map(p => <PropertyCard key={p.id} p={p} store={store}/>)}</div> : <div className="empty-state"><span className="empty-icon"><Heart size={24}/></span><h3>Nothing saved, for now.</h3><p>When a home catches your eye, tap the heart to keep it here.</p><Link className="button button-dark" to="/properties">Explore homes</Link></div>}</main>;
}
function ComparePage({ store }: { store: Store }) {
  const chosen = store.properties.filter(p => store.compare.includes(p.id));
  return <main className="container page-main"><div className="eyebrow"><span/> A clearer perspective</div><h1>Compare your <em>shortlist.</em></h1><p className="page-lede">Put the details side by side and see which home feels right.</p>{chosen.length < 2 ? <div className="empty-state"><span className="empty-icon"><ListFilter size={24}/></span><h3>Choose at least two homes.</h3><p>Add properties to comparison from the catalogue. You can compare up to four homes at a time.</p><Link to="/properties" className="button button-dark">Explore homes</Link></div> : <div className="compare-table-wrap"><table className="compare-table"><thead><tr><th>Property details</th>{chosen.map(p => <th key={p.id}><img src={p.images[0]} alt={p.title}/><Link to={`/property/${p.id}`}>{p.title}</Link><small>{p.location}</small><button className="remove-compare" onClick={() => store.toggleCompare(p.id)}><X size={13}/> Remove</button></th>)}</tr></thead><tbody>{[["Price", ...chosen.map(p => money(p.price,p.listing))],["Type", ...chosen.map(p => p.type)],["Listing", ...chosen.map(p => p.listing)],["Status", ...chosen.map(p => p.status)],["Area", ...chosen.map(p => areaLabel(p.area))],["Bedrooms", ...chosen.map(p => String(p.bedrooms))],["Bathrooms", ...chosen.map(p => String(p.bathrooms))],["Parking", ...chosen.map(p => String(p.parking))],["Furnishing", ...chosen.map(p => p.furnishing)],["Year built", ...chosen.map(p => String(p.yearBuilt))],["Amenities", ...chosen.map(p => p.amenities.join(", "))]].map(row => <tr key={row[0]}><th>{row[0]}</th>{row.slice(1).map((v,i) => <td key={i}>{v}</td>)}</tr>)}</tbody></table></div>}</main>;
}

function AboutPage() {
  return <main className="about-page"><section className="about-hero container"><div><div className="eyebrow"><span/> The story behind Aura Estates</div><h1>Good homes.<br/><em>Good beginnings.</em></h1><p>Finding a home is one of life's most personal decisions. We created Aura Estates to make that journey feel more thoughtful, more transparent, and a little more human.</p><Link className="button button-dark" to="/properties">Explore our collection <ArrowRight size={16}/></Link></div><img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1100&q=85" alt="Warm, light-filled home interior"/></section><section className="values-section"><div className="container"><div className="eyebrow light"><span/> What matters to us</div><h2>A better way to<br/><em>find your place.</em></h2><div className="values-grid"><div><span>01</span><h3>Thoughtfully chosen</h3><p>Every home in our collection is presented with care, with the details you need to make a confident decision.</p></div><div><span>02</span><h3>People before property</h3><p>We listen first, offer clear guidance, and help you explore at a pace that feels right.</p></div><div><span>03</span><h3>Details that matter</h3><p>From honest information to responsive service, we believe the little things make a big difference.</p></div></div></div></section><section className="about-bottom container"><div><div className="eyebrow"><span/> Let's make a move</div><h2>Your next chapter<br/><em>starts somewhere.</em></h2></div><Link to="/contact" className="button button-dark">Talk to our team <ArrowRight size={16}/></Link></section></main>;
}
function ContactPage({ store }: { store: Store }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.message.trim()) {setError("Please provide your name, a valid email, and a message.");return;} store.addInquiry({id:`IN-${Date.now()}`,propertyId:"general",name:form.name,email:form.email,phone:form.phone,message:form.message,date:"",time:"",createdAt:new Date().toISOString(),status:"New"}); void sendEmail({ Type:"General contact", Name:form.name, Email:form.email, Phone:form.phone||"—", Message:form.message }); setSent(true);setError(""); };
  return <main className="container page-main contact-page"><div className="contact-copy"><div className="eyebrow"><span/> Start a conversation</div><h1>Let's find your<br/><em>next chapter.</em></h1><p>Whether you have a home in mind or just know how you want to feel, we're here to help you take the next step.</p><div className="contact-detail"><span><Mail/></span><div><small>WRITE TO US</small><b>bashirahmad7576@gmail.com</b></div></div><div className="contact-detail"><span><Phone/></span><div><small>GIVE US A CALL</small><b>+923258247569</b></div></div><div className="contact-detail"><span><MapPin/></span><div><small>OUR HOME BASE</small><b>Lahore, Pakistan</b></div></div></div><div className="contact-form-card">{sent ? <div className="success-message large"><CheckCircle2 size={28}/><h2>Message received.</h2><p>Thank you for reaching out. Our team will be in touch soon.</p><button className="button button-outline" onClick={() => {setSent(false);setForm({name:"",email:"",phone:"",message:""});}}>Send another message</button></div> : <form className="inquiry-form" onSubmit={submit}><h2>Tell us a little about it.</h2><p>We'll take it from here.</p><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label><label>Email address<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Phone number <span className="optional">Optional</span><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+92 3xx xxxxxxx"/></label><label>How can we help?<textarea rows={5} required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Tell us what you're looking for..."/></label>{error&&<p className="form-error">{error}</p>}<button className="button button-dark full-width" type="submit">Send your message <ArrowRight size={16}/></button></form>}</div></main>;
}

function PropertyForm({ initial, onSave, onCancel }: { initial?: Property; onSave: (p: Property) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Property>(initial ?? {
    id: `HV-${Date.now().toString().slice(-6)}`, title:"", type:"House", listing:"Buy", location:"", price:0, area:0, bedrooms:3, bathrooms:2, parking:1, status:"Available", description:"", images:["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85"], amenities:[], furnishing:"Unfurnished", yearBuilt:new Date().getFullYear(), featured:false, createdAt:new Date().toISOString(), agent:{name:"Aura Estates Property Team",role:"Property Consultant",phone:"+923258247569",email:"bashirahmad7576@gmail.com"}
  });
  const [errors, setErrors] = useState<string[]>([]);
  const set = <K extends keyof Property,>(key: K, value: Property[K]) => setForm(old => ({...old,[key]:value}));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = [];
    if (!form.title.trim()) errs.push("Property title is required.");
    if (!form.location.trim()) errs.push("Location is required.");
    if (!Number.isFinite(form.price) || form.price <= 0) errs.push("Price must be greater than zero.");
    if (!Number.isFinite(form.area) || form.area <= 0) errs.push("Area must be greater than zero.");
    if (form.bedrooms < 0 || form.bathrooms < 0) errs.push("Bedrooms and bathrooms cannot be negative.");
    if (!form.description.trim()) errs.push("Description is required.");
    if (!form.images[0]?.trim()) errs.push("At least one image URL is required.");
    setErrors(errs); if (!errs.length) onSave({...form, title:form.title.trim(), location:form.location.trim(), description:form.description.trim(), images:form.images.filter(Boolean)});
  };
  return <form className="property-form" onSubmit={submit}>
    <div className="form-section-title"><span>01</span><div><h3>Property information</h3><p>Give this home a clear, descriptive identity.</p></div></div>
    <div className="form-grid"><label className="span-two">Property title *<input required value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. The Willow Residence"/></label><label>Property type<select value={form.type} onChange={e=>set("type",e.target.value as PropertyType)}>{["House","Apartment","Villa","Townhouse","Penthouse"].map(x=><option key={x}>{x}</option>)}</select></label><label>Listing type<select value={form.listing} onChange={e=>set("listing",e.target.value as "Buy"|"Rent")}><option>Buy</option><option>Rent</option></select></label><label className="span-two">Location *<input required value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Neighbourhood, city"/></label><label>Price (PKR) *<input type="number" required min="1" value={form.price || ""} onChange={e=>set("price",Number(e.target.value))}/></label><label>Area (sq ft) *<input type="number" required min="1" value={form.area || ""} onChange={e=>set("area",Number(e.target.value))}/></label><label>Bedrooms<input type="number" min="0" value={form.bedrooms} onChange={e=>set("bedrooms",Number(e.target.value))}/></label><label>Bathrooms<input type="number" min="0" value={form.bathrooms} onChange={e=>set("bathrooms",Number(e.target.value))}/></label><label>Parking spaces<input type="number" min="0" value={form.parking} onChange={e=>set("parking",Number(e.target.value))}/></label><label>Year built<input type="number" min="1800" max={new Date().getFullYear()+2} value={form.yearBuilt} onChange={e=>set("yearBuilt",Number(e.target.value))}/></label><label>Furnishing<select value={form.furnishing} onChange={e=>set("furnishing",e.target.value as Property["furnishing"])}><option>Furnished</option><option>Semi-furnished</option><option>Unfurnished</option></select></label><label>Status<select value={form.status} onChange={e=>set("status",e.target.value as PropertyStatus)}><option>Available</option><option>Sold</option><option>Rented</option></select></label><label className="span-two">Description *<textarea required rows={4} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Describe the home, its layout, and its neighbourhood."/></label><label className="span-two">Primary image URL *<input required type="url" value={form.images[0] ?? ""} onChange={e=>set("images",[e.target.value, ...form.images.slice(1)])} placeholder="https://..."/></label><label className="span-two">Additional image URLs <span className="optional">Comma separated</span><input value={form.images.slice(1).join(", ")} onChange={e=>set("images",[form.images[0],...e.target.value.split(",").map(x=>x.trim()).filter(Boolean)])} placeholder="https://..., https://..."/></label></div>
    <div className="form-section-title"><span>02</span><div><h3>Features & visibility</h3><p>Select the amenities that make this property special.</p></div></div><div className="amenity-checkboxes">{amenities.map(a=><label key={a}><input type="checkbox" checked={form.amenities.includes(a)} onChange={e=>set("amenities",e.target.checked?[...form.amenities,a]:form.amenities.filter(x=>x!==a))}/>{a}</label>)}</div><label className="featured-checkbox"><input type="checkbox" checked={form.featured} onChange={e=>set("featured",e.target.checked)}/> Feature this property on the homepage</label>
    {errors.length>0&&<div className="validation-box">{errors.map(e=><p key={e}>{e}</p>)}</div>}
    <div className="form-actions"><button className="button button-outline" type="button" onClick={onCancel}>Cancel</button><button className="button button-dark" type="submit">{initial ? "Save changes" : "Create property"} <ArrowRight size={16}/></button></div>
  </form>;
}

function AdminPage({ store, theme, onToggleTheme, onLogout }: { store: Store; theme: Theme; onToggleTheme: () => void; onLogout: () => void }) {
  const [tab, setTab] = useState<"overview"|"properties"|"inquiries">("overview");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [editing, setEditing] = useState<Property | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [notice, setNotice] = useState("");
  const [inquiryFilter, setInquiryFilter] = useState("All");
  const [inquirySearch, setInquirySearch] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const navigate = useNavigate();
  const available = store.properties.filter(p => p.status === "Available").length;
  const soldRented = store.properties.filter(p => p.status !== "Available").length;
  const featured = store.properties.filter(p => p.featured).length;
  const revenue = store.inquiries.length;
  const adminProperties = store.properties.filter(p => (!search || `${p.title} ${p.location} ${p.id}`.toLowerCase().includes(search.toLowerCase())) && (status === "All" || p.status === status));
  const saveProperty = (p: Property) => { if (editing === "new") store.addProperty(p); else store.updateProperty(p); setEditing(null); setNotice(editing === "new" ? "Property created successfully." : "Property changes saved."); setTimeout(() => setNotice(""), 3500); };
  const deleteProperty = () => { if (deleteTarget) { store.deleteProperty(deleteTarget.id); setNotice("Property deleted."); setDeleteTarget(null); setTimeout(() => setNotice(""), 3500); } };
  const updateInquiry = (id: string, value: Inquiry["status"]) => store.setInquiries(old => old.map(i => i.id === id ? {...i,status:value} : i));
  const inquiries = store.inquiries.filter(i => (inquiryFilter === "All" || i.status === inquiryFilter) && (!inquirySearch || `${i.name} ${i.email} ${i.propertyId}`.toLowerCase().includes(inquirySearch.toLowerCase())));
  return <main className="admin-shell">
    <aside className={`admin-sidebar ${mobileSidebar ? "sidebar-open" : ""}`}><Link to="/" className="brand admin-brand"><span className="brand-mark"><Home size={19}/></span><span>Aura Estates<span className="brand-dot">.</span><small>ADMINISTRATION</small></span></Link><div className="admin-workspace"><span className="workspace-avatar">H</span><div><b>Aura Estates Realty</b><small>Workspace · Admin</small></div><ChevronDown size={15}/></div><small className="sidebar-label">WORKSPACE</small><button className={tab==="overview"&&!editing?"side-link active": "side-link"} onClick={()=>{setTab("overview");setEditing(null);setMobileSidebar(false);}}><LayoutDashboard size={17}/> Overview</button><button className={tab==="properties"||editing?"side-link active":"side-link"} onClick={()=>{setTab("properties");setEditing(null);setMobileSidebar(false);}}><Building2 size={17}/> Properties <span>{store.properties.length}</span></button><button className={tab==="inquiries"?"side-link active":"side-link"} onClick={()=>{setTab("inquiries");setEditing(null);setMobileSidebar(false);}}><MessageSquare size={17}/> Inquiries <span>{store.inquiries.length}</span></button><div className="sidebar-bottom"><div className="admin-help"><CircleHelp size={17}/><b>Need a hand?</b><p>Everything you need to manage your collection.</p></div><button className="side-link" onClick={()=>{setAssistantOpen(true);setMobileSidebar(false);}}><Sparkles size={17}/> AI assistant</button><button className="side-link" onClick={()=>navigate("/")}><ArrowLeft size={17}/> Return to website</button><button className="side-link" onClick={onLogout}><LogOut size={17}/> Log out</button><div className="admin-user"><span className="user-avatar">HK</span><div><b>Aura Estates Admin</b><small>Administrator</small></div><ChevronDown size={15}/></div></div></aside>
    <div className="admin-main"><header className="admin-topbar"><button className="mobile-menu icon-btn admin-mobile-menu" onClick={()=>setMobileSidebar(!mobileSidebar)} aria-label="Open admin navigation"><Menu/></button><div className="breadcrumbs">Workspace <ChevronRight size={14}/> <b>{editing ? editing==="new"?"Add property":"Edit property" : tab==="overview"?"Overview":tab==="properties"?"Properties":"Inquiries"}</b></div><div className="topbar-right"><ThemeToggle theme={theme} onToggle={onToggleTheme} label="Switch admin theme"/><span className="live-dot"/> <span className="saved-status">All changes saved locally</span><span className="user-avatar">HK</span></div></header>
      <div className="admin-content">
        {notice&&<div className="notice"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice("")}><X size={15}/></button></div>}
        {editing ? <><div className="admin-page-heading"><button className="back-link" onClick={()=>setEditing(null)}><ArrowLeft size={15}/> Back to properties</button><h1>{editing==="new"?"Add a new property":"Edit property"}</h1><p>{editing==="new"?"Add a new home to your collection.":"Update property details. Changes appear on the public website immediately."}</p></div><div className="admin-form-card"><PropertyForm key={editing==="new"?"new":editing.id} initial={editing==="new"?undefined:editing} onSave={saveProperty} onCancel={()=>setEditing(null)}/></div></> :
        tab==="overview" ? <><div className="admin-page-heading"><div><div className="eyebrow"><span/> Your workspace</div><h1>Good morning, Aura Estates.</h1><p>Here's what's happening with your property collection.</p></div><button className="button button-dark" onClick={()=>{setTab("properties");setEditing("new");}}><Plus size={16}/> Add property</button></div>
          <div className="stat-grid"><div className="stat-card"><div className="stat-top"><span>Total properties</span><Building2/></div><b>{store.properties.length}</b><small><span className="stat-positive"><TrendingUp size={13}/> Collection</span> across all listings</small><div className="stat-spark"><i/><i/><i/><i/><i/><i/><i/></div></div><div className="stat-card"><div className="stat-top"><span>Available</span><CheckCircle2/></div><b>{available}</b><small>Ready to be discovered</small><div className="stat-progress"><span style={{width:`${store.properties.length ? available/store.properties.length*100:0}%`}}/></div></div><div className="stat-card"><div className="stat-top"><span>Sold / rented</span><Home/></div><b>{soldRented}</b><small>Listings no longer available</small><div className="stat-progress gold"><span style={{width:`${store.properties.length ? soldRented/store.properties.length*100:0}%`}}/></div></div><div className="stat-card"><div className="stat-top"><span>Featured homes</span><Star/></div><b>{featured}</b><small>Highlighted on the homepage</small><div className="stat-progress"><span style={{width:`${store.properties.length ? featured/store.properties.length*100:0}%`}}/></div></div></div>
          <div className="admin-dashboard-grid"><section className="admin-panel recent-panel"><div className="panel-heading"><div><h2>Recently added</h2><p>Your latest properties in the collection</p></div><button className="text-link" onClick={()=>setTab("properties")}>View all <ArrowRight size={15}/></button></div>{store.properties.slice(0,5).map(p=><div className="recent-property" key={p.id}><img src={p.images[0]} alt=""/><div className="recent-info"><b>{p.title}</b><small><MapPin size={12}/>{p.location}</small></div><span className="recent-price">{money(p.price,p.listing)}</span><button className="icon-btn small-icon" aria-label={`Edit ${p.title}`} onClick={()=>{setTab("properties");setEditing(p);}}><Pencil size={15}/></button></div>)}</section><section className="admin-panel activity-panel"><div className="panel-heading"><div><h2>At a glance</h2><p>Collection health</p></div><span className="panel-icon"><TrendingUp size={18}/></span></div><div className="activity-metric"><div><span>Property availability</span><b>{store.properties.length?Math.round(available/store.properties.length*100):0}%</b></div><div className="wide-progress"><span style={{width:`${store.properties.length?available/store.properties.length*100:0}%`}}/></div></div><div className="activity-metric"><div><span>Featured properties</span><b>{featured}</b></div><div className="wide-progress gold"><span style={{width:`${store.properties.length?featured/store.properties.length*100:0}%`}}/></div></div><div className="activity-metric"><div><span>New inquiries</span><b>{store.inquiries.filter(i=>i.status==="New").length}</b></div><p>Requests waiting for a response</p></div><button className="button button-outline full-width" onClick={()=>setTab("inquiries")}>Review inquiries <ArrowRight size={15}/></button></section></div>
          <section className="admin-panel status-panel"><div className="panel-heading"><div><h2>Listing status</h2><p>Current status of your property catalogue</p></div><button className="text-link" onClick={()=>setTab("properties")}>Manage listings <ArrowRight size={15}/></button></div><div className="status-bars">{[{label:"Available",value:available,color:"green"},{label:"Sold",value:store.properties.filter(p=>p.status==="Sold").length,color:"gold"},{label:"Rented",value:store.properties.filter(p=>p.status==="Rented").length,color:"blue"}].map(x=><div className="status-row" key={x.label}><span>{x.label}</span><div className="wide-progress"><span className={x.color} style={{width:`${store.properties.length?x.value/store.properties.length*100:0}%`}}/></div><b>{x.value}</b></div>)}</div></section>
        </> : tab==="properties" ? <><div className="admin-page-heading"><div><div className="eyebrow"><span/> Inventory management</div><h1>Your properties.</h1><p>Manage your collection from one considered workspace.</p></div><button className="button button-dark" onClick={()=>setEditing("new")}><Plus size={16}/> Add property</button></div><section className="admin-panel inventory-panel"><div className="inventory-toolbar"><div className="catalogue-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search properties"/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Available</option><option>Sold</option><option>Rented</option></select><span>{adminProperties.length} results</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Property</th><th>Type</th><th>Price</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead><tbody>{adminProperties.map(p=><tr key={p.id}><td><div className="table-property"><img src={p.images[0]} alt=""/><div><b>{p.title}</b><small>{p.location}</small><small>{p.id}</small></div></div></td><td>{p.type}<small className="table-sub">{p.listing}</small></td><td className="table-price">{money(p.price,p.listing)}</td><td><span className={`admin-status ${p.status.toLowerCase()}`}>{p.status}</span></td><td><button className={`toggle-feature ${p.featured?"on":""}`} aria-label="Toggle featured" onClick={()=>store.updateProperty({...p,featured:!p.featured})}><span/></button></td><td><div className="table-actions"><button className="icon-btn" title="View property" onClick={()=>navigate(`/property/${p.id}`)}><Eye size={15}/></button><button className="icon-btn" title="Edit property" onClick={()=>setEditing(p)}><Pencil size={15}/></button><button className="icon-btn danger-icon" title="Delete property" onClick={()=>setDeleteTarget(p)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{adminProperties.length===0&&<div className="table-empty">No properties match those filters.</div>}</div></section></> :
        <><div className="admin-page-heading"><div><div className="eyebrow"><span/> Customer conversations</div><h1>Inquiries.</h1><p>Viewing requests and messages from people exploring Aura Estates.</p></div></div><section className="admin-panel inventory-panel"><div className="inventory-toolbar"><div className="catalogue-search"><Search size={16}/><input value={inquirySearch} onChange={e=>setInquirySearch(e.target.value)} placeholder="Search name, email, property ID"/></div><select value={inquiryFilter} onChange={e=>setInquiryFilter(e.target.value)}><option>All</option><option>New</option><option>Contacted</option><option>Completed</option></select><span>{inquiries.length} inquiries</span></div>{inquiries.length ? <div className="inquiry-list">{inquiries.map(i=>{const property=store.properties.find(p=>p.id===i.propertyId);return <article className="inquiry-row" key={i.id}><div className="inquiry-person"><span className="user-avatar">{i.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}</span><div><b>{i.name}</b><small>{i.email} · {i.phone||"No phone provided"}</small><small>{property?.title??(i.propertyId==="general"?"General inquiry":"Property no longer available")} · {new Date(i.createdAt).toLocaleDateString()}</small></div></div><div className="inquiry-message">{i.message}{i.date&&<small><CalendarDays size={13}/> Viewing: {i.date} at {i.time}</small>}</div><select aria-label="Inquiry status" value={i.status} onChange={e=>updateInquiry(i.id,e.target.value as Inquiry["status"])}><option>New</option><option>Contacted</option><option>Completed</option></select></article>})}</div> : <div className="table-empty">No inquiries yet. Requests from the public site will appear here.</div>}</section></>}
      </div>
    </div>
    {deleteTarget&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setDeleteTarget(null);}}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span className="confirm-icon"><Trash2 size={22}/></span><h2 id="delete-title">Delete this property?</h2><p><b>{deleteTarget.title}</b> will be removed from the public collection. Related favourites, comparisons, and inquiries will also be removed. This action cannot be undone.</p><div className="modal-actions"><button className="button button-outline" onClick={()=>setDeleteTarget(null)}>Cancel</button><button className="button button-danger" onClick={deleteProperty}>Delete property</button></div></div></div>}
    {!assistantOpen && <button className="assistant-fab" onClick={()=>setAssistantOpen(true)}><Sparkles size={16}/> Ask AI</button>}
    {assistantOpen && <AiAssistant properties={store.properties} inquiries={store.inquiries} onClose={()=>setAssistantOpen(false)}/>}
  </main>;
}

function CompareDock({ store }: { store: Store }) {
  const { pathname } = useLocation();
  const selected = store.properties.filter(p => store.compare.includes(p.id));
  if (!selected.length || pathname.startsWith("/admin") || pathname === "/compare") return null;
  const ready = selected.length >= 2;
  return <div className="compare-dock"><div className="compare-dock-items">{selected.map(p=><div key={p.id} className="dock-property"><img src={p.images[0]} alt=""/><span>{p.title}</span><button aria-label="Remove from comparison" onClick={()=>store.toggleCompare(p.id)}><X size={13}/></button></div>)}</div><div className="dock-actions"><span>{selected.length}/4 selected</span>{ready ? <Link className="button button-dark" to="/compare">Compare homes <ArrowRight size={15}/></Link> : <span className="dock-hint">Pick one more to compare</span>}<button className="icon-btn" aria-label="Clear comparison" onClick={()=>store.clearCompare()}><Trash2 size={16}/></button></div></div>;
}
function Footer({ showAdmin }: { showAdmin: boolean }) { return <footer className="site-footer"><div className="container footer-main"><div className="footer-brand-col"><Link to="/" className="brand footer-brand"><span className="brand-mark"><Home size={19}/></span><span>Aura Estates<span className="brand-dot">.</span><small>PROPERTY COLLECTION</small></span></Link><p>A more considered way to find a place that feels like home.</p></div><div><b>Explore</b><Link to="/properties">All properties</Link><Link to="/favorites">Saved homes</Link><Link to="/compare">Compare homes</Link></div><div><b>Aura Estates</b><Link to="/about">Our story</Link><Link to="/contact">Contact us</Link>{showAdmin && <Link to="/admin">Admin portal</Link>}</div><div><b>Get in touch</b><span>Lahore, Pakistan</span><span>bashirahmad7576@gmail.com</span><span>+923258247569</span></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Aura Estates. Demo concept.</span><span>Thoughtfully found. Beautifully lived.</span></div></footer>; }

function PublicAssistant({ store }: { store: Store }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  if (location.pathname.startsWith("/admin")) return null;
  const raised = store.compare.length > 0 && location.pathname !== "/compare";
  return <>{!open && <button className={`assistant-fab${raised ? " raised" : ""}`} onClick={() => setOpen(true)}><Sparkles size={16}/> Ask Aura</button>}{open && <AiAssistant variant="public" properties={store.properties} onClose={() => setOpen(false)}/>}</>;
}

function AdminRoute({ store, theme, onToggleTheme, authed, onLogin, onLogout }: { store: Store; theme: Theme; onToggleTheme: () => void; authed: boolean; onLogin: () => void; onLogout: () => void }) {
  if (!authed) return <AdminLogin onLogin={onLogin} />;
  return <AdminPage store={store} theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout} />;
}

export default function App() {
  const store = useMarketplace();
  const [adminAuthed, setAdminAuthed] = useState(() => isAdminAuthenticated());
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (document.documentElement.dataset.theme as Theme) || (localStorage.getItem("haven-theme") as Theme) || "light"; }
    catch { return "light"; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === "dark" ? "#151714" : "#fbfaf7";
    try { localStorage.setItem("haven-theme", theme); } catch { /* storage may be unavailable */ }
  }, [theme]);
  const toggleTheme = () => setTheme(current => current === "light" ? "dark" : "light");
  return <><Header store={store} theme={theme} onToggleTheme={toggleTheme} showAdmin={adminAuthed}/><Routes><Route path="/" element={<HomePage store={store}/>}/><Route path="/properties" element={<PropertiesPage store={store}/>}/><Route path="/property/:id" element={<PropertyDetail store={store}/>}/><Route path="/favorites" element={<FavoritesPage store={store}/>}/><Route path="/compare" element={<ComparePage store={store}/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/contact" element={<ContactPage store={store}/>}/><Route path="/admin" element={<AdminRoute store={store} theme={theme} onToggleTheme={toggleTheme} authed={adminAuthed} onLogin={()=>setAdminAuthed(true)} onLogout={()=>{adminLogout();setAdminAuthed(false);}}/>}/><Route path="*" element={<main className="container page-main empty-state"><h1>Page not found</h1><Link className="button button-dark" to="/">Return home</Link></main>}/></Routes><Footer showAdmin={adminAuthed}/><CompareDock store={store}/><PublicAssistant store={store}/></>;
}