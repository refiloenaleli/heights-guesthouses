import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CalendarDays, MessageSquare, Image, Phone, LogOut, Check, X,
  Star, Upload, Trash2, Settings, Users, Home, Tag, UtensilsCrossed, DollarSign, Plus, Edit, Save,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

type Tab = "bookings" | "reviews" | "gallery" | "contacts" | "promotions" | "menus" | "prices";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<"greater-heights" | "new-heights">("greater-heights");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/admin/login" }); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
      if (!data) { navigate({ to: "/admin/login" }); return; }
      setIsAdmin(true);
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); };

  if (isAdmin === null) return <div className="min-h-screen bg-charcoal flex items-center justify-center -mt-[88px] pt-[88px]"><p className="text-warm-white/60">Loading...</p></div>;

  const tabs: { key: Tab; label: string; icon: typeof CalendarDays }[] = [
    { key: "bookings", label: "Bookings", icon: CalendarDays },
    { key: "reviews", label: "Reviews", icon: MessageSquare },
    { key: "gallery", label: "Gallery", icon: Image },
    { key: "contacts", label: "Contacts", icon: Phone },
    { key: "promotions", label: "Promos", icon: Tag },
    { key: "menus", label: "Menus", icon: UtensilsCrossed },
    { key: "prices", label: "Prices", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-background -mt-[88px] pt-[88px]">
      <div className="bg-charcoal border-b border-gold/20">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Settings className="h-5 w-5 text-gold" />
            <h1 className="font-heading text-xl text-warm-white">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <select value={selectedHouse} onChange={(e) => setSelectedHouse(e.target.value as any)} className="bg-charcoal-light border border-gold/20 text-warm-white text-xs px-3 py-2 focus:outline-none focus:border-gold-dark">
              <option value="greater-heights">Greater Heights</option>
              <option value="new-heights">New Heights</option>
            </select>
            <Link to="/" className="text-xs text-gold-light/60 hover:text-gold-light flex items-center gap-1"><Home className="h-3 w-3" /> Site</Link>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-warm-white/60 hover:text-warm-white"><LogOut className="h-3 w-3" /> Logout</button>
          </div>
        </div>
      </div>

      <div className="bg-cream border-b border-border overflow-x-auto">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-3 text-xs tracking-widest uppercase border-b-2 transition-all whitespace-nowrap ${activeTab === tab.key ? "border-gold-dark text-gold-dark font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <tab.icon className="h-4 w-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {activeTab === "bookings" && <BookingsPanel house={selectedHouse} />}
        {activeTab === "reviews" && <ReviewsPanel house={selectedHouse} />}
        {activeTab === "gallery" && <GalleryPanel house={selectedHouse} />}
        {activeTab === "contacts" && <ContactsPanel house={selectedHouse} />}
        {activeTab === "promotions" && <PromotionsPanel house={selectedHouse} />}
        {activeTab === "menus" && <MenusPanel house={selectedHouse} />}
        {activeTab === "prices" && <PricesPanel house={selectedHouse} />}
      </div>
    </div>
  );
}

/* ==================== BOOKINGS ==================== */
function BookingsPanel({ house }: { house: string }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*").eq("guest_house", house).order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id: string, status: string) => { await supabase.from("bookings").update({ status }).eq("id", id); fetch(); };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Manage Bookings</h2>
      {bookings.length === 0 ? <p className="text-sm text-muted-foreground">No bookings yet.</p> : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-card border border-border p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-gold-dark" />
                  <h3 className="text-sm font-semibold text-foreground">{b.guest_name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-medium ${b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "cancelled" ? "bg-red-100 text-red-700" : b.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{b.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{b.room_type} · {b.guests_count} guest(s) · {b.check_in} → {b.check_out}</p>
                <p className="text-xs text-muted-foreground mt-1">📧 {b.guest_email} · 📞 {b.guest_phone}</p>
                {b.special_requests && <p className="text-xs text-muted-foreground mt-1 italic">"{b.special_requests}"</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                {b.status === "pending" && (<><button onClick={() => updateStatus(b.id, "confirmed")} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs"><Check className="h-3 w-3" /> Confirm</button><button onClick={() => updateStatus(b.id, "cancelled")} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs"><X className="h-3 w-3" /> Cancel</button></>)}
                {b.status === "confirmed" && <button onClick={() => updateStatus(b.id, "completed")} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs"><Check className="h-3 w-3" /> Complete</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== REVIEWS ==================== */
function ReviewsPanel({ house }: { house: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("reviews").select("*").eq("guest_house", house).order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleApproval = async (id: string, current: boolean) => { await supabase.from("reviews").update({ is_approved: !current }).eq("id", id); fetchData(); };
  const deleteReview = async (id: string) => { await supabase.from("reviews").delete().eq("id", id); fetchData(); };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Manage Reviews</h2>
      {reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{r.reviewer_name}</h3>
                  <div className="flex gap-0.5">{[1,2,3,4,5].map((i) => <Star key={i} className={`h-3 w-3 ${i <= r.rating ? "fill-gold text-gold" : "text-border"}`} />)}</div>
                  <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider ${r.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{r.is_approved ? "Approved" : "Pending"}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{r.comment}</p>
              <div className="flex gap-2">
                <button onClick={() => toggleApproval(r.id, r.is_approved)} className={`text-xs px-3 py-1.5 ${r.is_approved ? "bg-yellow-600" : "bg-green-600"} text-white`}>{r.is_approved ? "Unapprove" : "Approve"}</button>
                <button onClick={() => deleteReview(r.id)} className="text-xs px-3 py-1.5 bg-red-600 text-white flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== GALLERY ==================== */
function GalleryPanel({ house }: { house: string }) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("General");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("gallery_images").select("*").eq("guest_house", house).order("display_order");
    setImages(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newAlt) return;
    setUploading(true);
    const fileName = `${house}/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("gallery").upload(fileName, file);
    if (error) { alert("Upload failed: " + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(fileName);
    await supabase.from("gallery_images").insert({ guest_house: house, image_url: urlData.publicUrl, alt_text: newAlt, category: newCategory, display_order: images.length });
    setNewAlt(""); setNewCategory("General"); setUploading(false); fetchData();
  };

  const deleteImage = async (id: string, imageUrl: string) => {
    const pathMatch = imageUrl.match(/gallery\/(.+)$/);
    if (pathMatch) await supabase.storage.from("gallery").remove([pathMatch[1]]);
    await supabase.from("gallery_images").delete().eq("id", id); fetchData();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Manage Gallery</h2>
      <div className="bg-cream border border-border p-6 mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-4">Upload New Image</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Image description" value={newAlt} onChange={(e) => setNewAlt(e.target.value)} className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark" />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark">
            {["General", "Rooms", "Facilities", "Dining", "Exterior", "Interior"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className={`btn-gold flex items-center justify-center gap-2 cursor-pointer ${uploading || !newAlt ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload className="h-4 w-4" />{uploading ? "Uploading..." : "Choose & Upload"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading || !newAlt} />
          </label>
        </div>
      </div>
      {images.length === 0 ? <p className="text-sm text-muted-foreground">No gallery images yet.</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group bg-card border border-border overflow-hidden">
              <img src={img.image_url} alt={img.alt_text} className="w-full h-40 object-cover" />
              <div className="p-3"><p className="text-xs font-medium text-foreground truncate">{img.alt_text}</p><p className="text-[10px] text-muted-foreground">{img.category}</p></div>
              <button onClick={() => deleteImage(img.id, img.image_url)} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== CONTACTS ==================== */
function ContactsPanel({ house }: { house: string }) {
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("contact_settings").select("*").eq("guest_house", house).single();
    setContact(data);
    setLoading(false);
  }, [house]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!contact) return;
    setSaving(true);
    await supabase.from("contact_settings").update({ phone: contact.phone, email: contact.email, whatsapp: contact.whatsapp, address: contact.address }).eq("guest_house", house);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (!contact) return <p className="text-sm text-muted-foreground">No contact settings found.</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Contact Details</h2>
      <div className="bg-card border border-border p-6 max-w-lg space-y-4">
        {[{ label: "Phone Number", key: "phone" }, { label: "Email Address", key: "email" }, { label: "WhatsApp Number", key: "whatsapp" }, { label: "Physical Address", key: "address" }].map((field) => (
          <div key={field.key}>
            <label className="text-xs tracking-widest uppercase text-muted-foreground mb-1 block">{field.label}</label>
            <input type="text" value={contact[field.key] || ""} onChange={(e) => setContact({ ...contact, [field.key]: e.target.value })} className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-gold-dark" />
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          {saved && <span className="text-sm text-green-600">✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}

/* ==================== PROMOTIONS ==================== */
function PromotionsPanel({ house }: { house: string }) {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", discount_percentage: 0, valid_from: "", valid_until: "", is_active: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("promotions").select("*").eq("guest_house", house).order("created_at", { ascending: false });
    setPromos(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!form.title) return;
    await supabase.from("promotions").insert({ ...form, guest_house: house });
    setForm({ title: "", description: "", discount_percentage: 0, valid_from: "", valid_until: "", is_active: true });
    setShowForm(false); fetchData();
  };

  const toggleActive = async (id: string, current: boolean) => { await supabase.from("promotions").update({ is_active: !current }).eq("id", id); fetchData(); };
  const deletePromo = async (id: string) => { await supabase.from("promotions").delete().eq("id", id); fetchData(); };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-foreground">Promotions</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold flex items-center gap-2 text-xs"><Plus className="h-3 w-3" /> Add Promotion</button>
      </div>

      {showForm && (
        <div className="bg-cream border border-border p-6 mb-6 space-y-4">
          <input type="text" placeholder="Promotion title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark" />
          <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark" />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Discount %</label>
              <input type="number" value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: parseInt(e.target.value) || 0 })} className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Valid From</label>
              <input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Valid Until</label>
              <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark" />
            </div>
          </div>
          <button onClick={handleAdd} className="btn-gold text-xs">Save Promotion</button>
        </div>
      )}

      {promos.length === 0 ? <p className="text-sm text-muted-foreground">No promotions yet.</p> : (
        <div className="space-y-4">
          {promos.map((p) => (
            <div key={p.id} className="bg-card border border-border p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                  {p.discount_percentage > 0 && <span className="text-[10px] px-2 py-0.5 bg-gold-dark text-warm-white font-bold">{p.discount_percentage}% OFF</span>}
                  <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.is_active ? "Active" : "Inactive"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.description}</p>
                {p.valid_from && <p className="text-xs text-muted-foreground mt-1">{p.valid_from} → {p.valid_until}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toggleActive(p.id, p.is_active)} className={`text-xs px-3 py-1.5 ${p.is_active ? "bg-yellow-600" : "bg-green-600"} text-white`}>{p.is_active ? "Deactivate" : "Activate"}</button>
                <button onClick={() => deletePromo(p.id)} className="text-xs px-3 py-1.5 bg-red-600 text-white flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== MENUS ==================== */
function MenusPanel({ house }: { house: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "breakfast" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "", category: "breakfast" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("menu_items").select("*").eq("guest_house", house).order("category").order("display_order");
    setItems(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!form.name || !form.price) return;
    await supabase.from("menu_items").insert({ ...form, guest_house: house, display_order: items.length });
    setForm({ name: "", description: "", price: "", category: "breakfast" }); setShowForm(false); fetchData();
  };

  const startEdit = (item: any) => { setEditingId(item.id); setEditForm({ name: item.name, description: item.description, price: item.price, category: item.category }); };
  const saveEdit = async () => {
    if (!editingId) return;
    await supabase.from("menu_items").update(editForm).eq("id", editingId);
    setEditingId(null); fetchData();
  };
  const deleteItem = async (id: string) => { await supabase.from("menu_items").delete().eq("id", id); fetchData(); };

  const categories = ["breakfast", "lunch", "dinner"];
  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-foreground">Menu Items</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold flex items-center gap-2 text-xs"><Plus className="h-3 w-3" /> Add Item</button>
      </div>

      {showForm && (
        <div className="bg-cream border border-border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark" />
            <input type="text" placeholder="Price (e.g. M85)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark" />
          </div>
          <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark">
            {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <button onClick={handleAdd} className="btn-gold text-xs">Save Item</button>
        </div>
      )}

      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="mb-8">
            <h3 className="font-heading text-lg text-foreground capitalize border-b border-border pb-2 mb-4">{cat}</h3>
            <div className="space-y-3">
              {catItems.map((item) => (
                <div key={item.id} className="bg-card border border-border p-4">
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark" />
                        <input value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark" />
                      </div>
                      <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark" />
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="text-xs px-3 py-1.5 bg-green-600 text-white flex items-center gap-1"><Save className="h-3 w-3" /> Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 bg-gray-500 text-white">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gold-dark">{item.price}</span>
                        <button onClick={() => startEdit(item)} className="text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==================== PRICES ==================== */
function PricesPanel({ house }: { house: string }) {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ price: "", description: "", features: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("room_prices").select("*").eq("guest_house", house).order("display_order");
    setPrices(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({ price: item.price, description: item.description, features: (item.features || []).join(", ") });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await supabase.from("room_prices").update({
      price: editForm.price,
      description: editForm.description,
      features: editForm.features.split(",").map((f: string) => f.trim()).filter(Boolean),
    }).eq("id", editingId);
    setEditingId(null); fetchData();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Room Prices</h2>
      <div className="space-y-4">
        {prices.map((p) => (
          <div key={p.id} className="bg-card border border-border p-5">
            {editingId === p.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-foreground">{p.room_type}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Price</label>
                    <input value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Features (comma-separated)</label>
                    <input value={editForm.features} onChange={(e) => setEditForm({ ...editForm, features: e.target.value })} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="text-xs px-3 py-1.5 bg-green-600 text-white flex items-center gap-1"><Save className="h-3 w-3" /> Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 bg-gray-500 text-white">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{p.room_type}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(p.features || []).map((f: string) => <span key={f} className="text-[10px] px-2 py-0.5 bg-cream text-muted-foreground">{f}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-heading text-gold-dark">{p.price}</span>
                  <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
