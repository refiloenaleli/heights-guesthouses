import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  CalendarDays,
  MessageSquare,
  Image,
  Phone,
  LogOut,
  Check,
  X,
  Star,
  Upload,
  Trash2,
  Settings,
  Users,
  Home,
  Tag,
  UtensilsCrossed,
  DollarSign,
  Plus,
  Edit,
  Save,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import ghExterior from "@/assets/gh-exterior.jpg";
import nhExterior1 from "@/assets/nh-exterior1.jpg";
import ghLogo from "@/assets/gh-logo.jpg";
import nhLogo from "@/assets/inspiration pitures/WhatsApp Image 2026-08-22 at 1.11.41 AM.jpeg";
import ghCoupleRoom from "@/assets/gh-couple-room.jpg";
import nhCoupleRoom from "@/assets/nh-couple-room.jpg";
import ghOutdoorDining from "@/assets/gh-outdoor-dining.jpg";
import nhDining2 from "@/assets/nh-dining2.jpg";
import ghDining from "@/assets/gh-dining.jpg";
import nhDining1 from "@/assets/nh-dining1.jpg";
import diningInterior from "@/assets/dining.jpg";

type Booking = Tables<"bookings">;
type Review = Tables<"reviews">;
type GalleryImage = Tables<"gallery_images">;
type ContactSettings = Tables<"contact_settings">;
type Promotion = Tables<"promotions">;
type MenuItem = Tables<"menu_items">;
type RoomPrice = Tables<"room_prices">;
type RoomImage = Tables<"room_images">;
type DiningBanner = Tables<"dining_banners">;
type MenuImageRow = Tables<"menu_images">;

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

type Tab =
  | "bookings"
  | "reviews"
  | "gallery"
  | "contacts"
  | "promotions"
  | "menus"
  | "prices"
  | "room-images"
  | "dining-banners"
  | "menu-images"
  | "site-images";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<"greater-heights" | "new-heights">(
    "greater-heights",
  );
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function checkAdmin() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!sessionData.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      // Require the admin role so RLS lets the dashboard write to the database
      // and storage. Without this the image uploads/saves are silently blocked.
      try {
        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: sessionData.session.user.id,
          _role: "admin",
        });
        if (cancelled) return;
        if (!isAdmin) {
          navigate({ to: "/admin/login" });
          return;
        }
        setIsAdmin(true);
      } catch {
        if (cancelled) return;
        navigate({ to: "/admin/login" });
      }
    }
    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (isAdmin === null)
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center -mt-[88px] pt-[88px]">
        <p className="text-warm-white/60">Loading...</p>
      </div>
    );

  const tabs: { key: Tab; label: string; icon: typeof CalendarDays }[] = [
    { key: "bookings", label: "Bookings", icon: CalendarDays },
    { key: "reviews", label: "Reviews", icon: MessageSquare },
    { key: "gallery", label: "Gallery", icon: Image },
    { key: "contacts", label: "Contacts", icon: Phone },
    { key: "promotions", label: "Promos", icon: Tag },
    { key: "menus", label: "Menus", icon: UtensilsCrossed },
    { key: "prices", label: "Prices", icon: DollarSign },
    { key: "room-images", label: "Room Images", icon: Image },
    { key: "dining-banners", label: "Dining Banners", icon: Image },
    { key: "menu-images", label: "Menu Images", icon: Image },
    { key: "site-images", label: "Site Images", icon: Image },
  ];

  const selectedHouseLabel =
    selectedHouse === "greater-heights" ? "Greater Heights" : "New Heights";
  const activeTabLabel = tabs.find((tab) => tab.key === activeTab)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(183,144,82,0.12),_transparent_35%),var(--color-background)] -mt-[88px] pt-[88px]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="rounded-[28px] border border-border/80 bg-charcoal text-warm-white shadow-[0_24px_70px_rgba(17,17,17,0.18)]">
          <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold-light ring-1 ring-gold/25">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-gold-light/80">
                  Control centre
                </p>
                <h1 className="font-heading text-2xl text-warm-white">Admin Dashboard</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-full border border-gold/25 bg-charcoal-light/80 px-3 py-2 text-xs text-warm-white/80">
                <span className="text-[10px] uppercase tracking-[0.18em] text-gold-light/75">
                  Property
                </span>
                <select
                  value={selectedHouse}
                  onChange={(e) =>
                    setSelectedHouse(e.target.value as "greater-heights" | "new-heights")
                  }
                  className="bg-transparent pr-2 font-medium text-warm-white outline-none"
                >
                  <option value="greater-heights" className="text-charcoal">
                    Greater Heights
                  </option>
                  <option value="new-heights" className="text-charcoal">
                    New Heights
                  </option>
                </select>
              </label>

              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-2 text-xs font-medium text-gold-light transition hover:bg-gold/15"
              >
                <Home className="h-3 w-3" /> View site
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-warm-white/15 bg-warm-white/5 px-3 py-2 text-xs font-medium text-warm-white/75 transition hover:bg-warm-white/10 hover:text-warm-white"
              >
                <LogOut className="h-3 w-3" /> Logout
              </button>
            </div>
          </div>
        </header>

        <div className="mt-6 rounded-[24px] border border-border/80 bg-card/80 p-2 shadow-[0_18px_40px_rgba(30,30,30,0.06)] backdrop-blur-sm">
          <div className="overflow-x-auto">
            <div className="flex min-w-max gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all whitespace-nowrap ${
                      isActive
                        ? "border-gold/40 bg-gold-dark text-warm-white shadow-md shadow-gold/15"
                        : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-border/80 bg-card shadow-[0_24px_70px_rgba(26,26,26,0.07)]">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Active section
              </p>
              <h2 className="mt-1 font-heading text-2xl text-foreground">{activeTabLabel}</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/15 bg-gold/8 px-3 py-2 text-xs font-medium text-gold-dark">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              {selectedHouseLabel}
            </div>
          </div>

          <div className="p-5 md:p-6">
            {activeTab === "bookings" && <BookingsPanel house={selectedHouse} />}
            {activeTab === "reviews" && <ReviewsPanel house={selectedHouse} />}
            {activeTab === "gallery" && <GalleryPanel house={selectedHouse} />}
            {activeTab === "contacts" && <ContactsPanel house={selectedHouse} />}
            {activeTab === "promotions" && <PromotionsPanel house={selectedHouse} />}
            {activeTab === "menus" && <MenusPanel house={selectedHouse} />}
            {activeTab === "prices" && <PricesPanel house={selectedHouse} />}
            {activeTab === "room-images" && <RoomImagesPanel house={selectedHouse} />}
            {activeTab === "dining-banners" && <DiningBannersPanel house={selectedHouse} />}
            {activeTab === "menu-images" && <MenuImagesPanel house={selectedHouse} />}
            {activeTab === "site-images" && <SiteImagesPanel house={selectedHouse} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== BOOKINGS ==================== */
function BookingsPanel({ house }: { house: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("guest_house", house)
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetch();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Manage Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-card border border-border p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-gold-dark" />
                  <h3 className="text-sm font-semibold text-foreground">{b.guest_name}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-medium ${b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "cancelled" ? "bg-red-100 text-red-700" : b.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {b.room_type} · {b.guests_count} guest(s) · {b.check_in} → {b.check_out}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  📧 {b.guest_email} · 📞 {b.guest_phone}
                </p>
                {b.special_requests && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    "{b.special_requests}"
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {b.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(b.id, "confirmed")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs"
                    >
                      <Check className="h-3 w-3" /> Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, "cancelled")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs"
                    >
                      <X className="h-3 w-3" /> Cancel
                    </button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(b.id, "completed")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs"
                  >
                    <Check className="h-3 w-3" /> Complete
                  </button>
                )}
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("guest_house", house)
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleApproval = async (id: string, current: boolean) => {
    await supabase.from("reviews").update({ is_approved: !current }).eq("id", id);
    fetchData();
  };
  const deleteReview = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Manage Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{r.reviewer_name}</h3>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i <= r.rating ? "fill-gold text-gold" : "text-border"}`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 uppercase tracking-wider ${r.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {r.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{r.comment}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleApproval(r.id, r.is_approved)}
                  className={`text-xs px-3 py-1.5 ${r.is_approved ? "bg-yellow-600" : "bg-green-600"} text-white`}
                >
                  {r.is_approved ? "Unapprove" : "Approve"}
                </button>
                <button
                  onClick={() => deleteReview(r.id)}
                  className="text-xs px-3 py-1.5 bg-red-600 text-white flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
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
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("General");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("guest_house", house)
      .order("display_order");
    setImages(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newAlt) return;
    setUploading(true);
    const fileName = `${house}/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("gallery").upload(fileName, file);
    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(fileName);
    await supabase.from("gallery_images").insert({
      guest_house: house,
      image_url: urlData.publicUrl,
      alt_text: newAlt,
      category: newCategory,
      display_order: images.length,
    });
    setNewAlt("");
    setNewCategory("General");
    setUploading(false);
    fetchData();
  };

  const deleteImage = async (id: string, imageUrl: string) => {
    const pathMatch = imageUrl.match(/gallery\/(.+)$/);
    if (pathMatch) await supabase.storage.from("gallery").remove([pathMatch[1]]);
    await supabase.from("gallery_images").delete().eq("id", id);
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Manage Gallery</h2>
      <div className="bg-cream border border-border p-6 mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-4">Upload New Image</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Image description"
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
            className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          >
            {["General", "Rooms", "Facilities", "Dining", "Exterior", "Interior"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label
            className={`btn-gold flex items-center justify-center gap-2 cursor-pointer ${uploading || !newAlt ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Choose & Upload"}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading || !newAlt}
            />
          </label>
        </div>
      </div>
      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No gallery images yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group bg-card border border-border overflow-hidden"
            >
              <img src={img.image_url} alt={img.alt_text} className="w-full h-40 object-cover" />
              <div className="p-3">
                <p className="text-xs font-medium text-foreground truncate">{img.alt_text}</p>
                <p className="text-[10px] text-muted-foreground">{img.category}</p>
              </div>
              <button
                onClick={() => deleteImage(img.id, img.image_url)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== CONTACTS ==================== */
function ContactsPanel({ house }: { house: string }) {
  const [contact, setContact] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_settings")
      .select("*")
      .eq("guest_house", house)
      .single();
    setContact(data);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!contact) return;
    setSaving(true);
    await supabase
      .from("contact_settings")
      .update({
        phone: contact.phone,
        email: contact.email,
        whatsapp: contact.whatsapp,
        address: contact.address,
      })
      .eq("guest_house", house);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (!contact) return <p className="text-sm text-muted-foreground">No contact settings found.</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Contact Details</h2>
      <div className="bg-card border border-border p-6 max-w-lg space-y-4">
        {[
          { label: "Phone Number", key: "phone" },
          { label: "Email Address", key: "email" },
          { label: "WhatsApp Number", key: "whatsapp" },
          { label: "Physical Address", key: "address" },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-xs tracking-widest uppercase text-muted-foreground mb-1 block">
              {field.label}
            </label>
            <input
              type="text"
              value={contact[field.key as keyof ContactSettings] || ""}
              onChange={(e) => setContact({ ...contact, [field.key]: e.target.value })}
              className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-gold-dark"
            />
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-sm text-green-600">✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}

/* ==================== PROMOTIONS ==================== */
function PromotionsPanel({ house }: { house: string }) {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    discount_percentage: 0,
    valid_from: "",
    valid_until: "",
    is_active: true,
    image_url: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .eq("guest_house", house)
      .order("created_at", { ascending: false });
    setPromos(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `promos/${house}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site_images").upload(path, file);
    if (error) {
      alert("Image upload failed: " + error.message);
    } else {
      const { data } = supabase.storage.from("site_images").getPublicUrl(path);
      setForm((p) => ({ ...p, image_url: data.publicUrl }));
    }
    setUploadingImage(false);
  };

  const handleAdd = async () => {
    if (!form.title) return;
    await supabase.from("promotions").insert({
      ...form,
      image_url: form.image_url || null,
      guest_house: house,
    });
    setForm({
      title: "",
      description: "",
      discount_percentage: 0,
      valid_from: "",
      valid_until: "",
      is_active: true,
      image_url: "",
    });
    setShowForm(false);
    fetchData();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("promotions").update({ is_active: !current }).eq("id", id);
    fetchData();
  };
  const deletePromo = async (id: string) => {
    await supabase.from("promotions").delete().eq("id", id);
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-foreground">Promotions</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-gold flex items-center gap-2 text-xs"
        >
          <Plus className="h-3 w-3" /> Add Promotion
        </button>
      </div>

      {showForm && (
        <div className="bg-cream border border-border p-6 mb-6 space-y-4">
          <input
            type="text"
            placeholder="Promotion title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Promo Image (optional — shown on the home page banner)
            </label>
            {form.image_url && (
              <img
                src={form.image_url}
                alt="Promo preview"
                className="h-20 w-32 object-cover border border-border mb-2"
              />
            )}
            <label
              className={`btn-gold-outline inline-flex cursor-pointer items-center gap-1.5 text-xs ${
                uploadingImage ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <Upload className="h-3 w-3" />
              {uploadingImage ? "Uploading..." : form.image_url ? "Replace Image" : "Upload Image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Discount %</label>
              <input
                type="number"
                value={form.discount_percentage}
                onChange={(e) =>
                  setForm({ ...form, discount_percentage: parseInt(e.target.value) || 0 })
                }
                className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Valid From</label>
              <input
                type="date"
                value={form.valid_from}
                onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Valid Until</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
              />
            </div>
          </div>
          <button onClick={handleAdd} className="btn-gold text-xs">
            Save Promotion
          </button>
        </div>
      )}

      {promos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No promotions yet.</p>
      ) : (
        <div className="space-y-4">
          {promos.map((p) => (
            <div
              key={p.id}
              className="bg-card border border-border p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                  {(p.discount_percentage ?? 0) > 0 && (
                    <span className="text-[10px] px-2 py-0.5 bg-gold-dark text-warm-white font-bold">
                      {p.discount_percentage}% OFF
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 uppercase tracking-wider ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{p.description}</p>
                {p.valid_from && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.valid_from} → {p.valid_until}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(p.id, p.is_active)}
                  className={`text-xs px-3 py-1.5 ${p.is_active ? "bg-yellow-600" : "bg-green-600"} text-white`}
                >
                  {p.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => deletePromo(p.id)}
                  className="text-xs px-3 py-1.5 bg-red-600 text-white flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
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
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "breakfast" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "breakfast",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("guest_house", house)
      .order("category")
      .order("display_order");
    setItems(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!form.name || !form.price) return;
    await supabase
      .from("menu_items")
      .insert({ ...form, guest_house: house, display_order: items.length });
    setForm({ name: "", description: "", price: "", category: "breakfast" });
    setShowForm(false);
    fetchData();
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
    });
  };
  const saveEdit = async () => {
    if (!editingId) return;
    await supabase.from("menu_items").update(editForm).eq("id", editingId);
    setEditingId(null);
    fetchData();
  };
  const deleteItem = async (id: string) => {
    await supabase.from("menu_items").delete().eq("id", id);
    fetchData();
  };

  const categories = ["breakfast", "lunch", "dinner"];
  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-foreground">Menu Items</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-gold flex items-center gap-2 text-xs"
        >
          <Plus className="h-3 w-3" /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-cream border border-border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Item name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
            />
            <input
              type="text"
              placeholder="Price (e.g. M85)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
            />
          </div>
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <button onClick={handleAdd} className="btn-gold text-xs">
            Save Item
          </button>
        </div>
      )}

      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="mb-8">
            <h3 className="font-heading text-lg text-foreground capitalize border-b border-border pb-2 mb-4">
              {cat}
            </h3>
            <div className="space-y-3">
              {catItems.map((item) => (
                <div key={item.id} className="bg-card border border-border p-4">
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark"
                        />
                        <input
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark"
                        />
                      </div>
                      <input
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="text-xs px-3 py-1.5 bg-green-600 text-white flex items-center gap-1"
                        >
                          <Save className="h-3 w-3" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs px-3 py-1.5 bg-gray-500 text-white"
                        >
                          Cancel
                        </button>
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
                        <button
                          onClick={() => startEdit(item)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
  const [prices, setPrices] = useState<RoomPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ price: "", description: "", features: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("room_prices")
      .select("*")
      .eq("guest_house", house)
      .order("display_order");
    setPrices(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEdit = (item: RoomPrice) => {
    setEditingId(item.id);
    setEditForm({
      price: item.price,
      description: item.description,
      features: (item.features || []).join(", "),
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await supabase
      .from("room_prices")
      .update({
        price: editForm.price,
        description: editForm.description,
        features: editForm.features
          .split(",")
          .map((f: string) => f.trim())
          .filter(Boolean),
      })
      .eq("id", editingId);
    setEditingId(null);
    fetchData();
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
                    <input
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Features (comma-separated)
                    </label>
                    <input
                      value={editForm.features}
                      onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                      className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={2}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="text-xs px-3 py-1.5 bg-green-600 text-white flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs px-3 py-1.5 bg-gray-500 text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{p.room_type}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(p.features || []).map((f: string) => (
                      <span
                        key={f}
                        className="text-[10px] px-2 py-0.5 bg-cream text-muted-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-heading text-gold-dark">{p.price}</span>
                  <button
                    onClick={() => startEdit(p)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== ROOM IMAGES ==================== */
function RoomImagesPanel({ house }: { house: string }) {
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [images, setImages] = useState<RoomImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [newAlt, setNewAlt] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: prices } = await supabase
      .from("room_prices")
      .select("room_type")
      .eq("guest_house", house)
      .order("display_order");
    const types = [...new Set((prices || []).map((p) => p.room_type))];
    setRoomTypes(types);
    // Keep the current selection only if it exists in this house's rooms,
    // otherwise fall back to the first available room type.
    setSelectedRoomType((prev) => (prev && types.includes(prev) ? prev : types[0] || ""));
    const { data } = await supabase
      .from("room_images")
      .select("*")
      .eq("guest_house", house)
      .order("display_order");
    setImages(data || []);
    setLoading(false);
  }, [house]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoomType) return;
    setUploading(true);
    const fileName = `${house}/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("room_images").upload(fileName, file);
    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("room_images").getPublicUrl(fileName);
    await supabase.from("room_images").insert({
      guest_house: house,
      room_type: selectedRoomType,
      image_url: urlData.publicUrl,
      alt_text: newAlt || `${selectedRoomType} image`,
      display_order: images.length,
    });
    setNewAlt("");
    setUploading(false);
    fetchData();
  };

  const deleteImage = async (id: string, imageUrl: string) => {
    const pathMatch = imageUrl.match(/room_images\/(.+)$/);
    if (pathMatch) await supabase.storage.from("room_images").remove([pathMatch[1]]);
    await supabase.from("room_images").delete().eq("id", id);
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Room Images</h2>
      <p className="text-xs text-muted-foreground mb-6">
        Upload additional images for each room type. These will appear in the room detail modal.
      </p>
      <div className="bg-cream border border-border p-6 mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-4">Upload New Room Image</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          >
            {roomTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Image description (optional)"
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
            className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          />
          <label
            className={`btn-gold flex items-center justify-center gap-2 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Choose & Upload"}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>
      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No room images yet.</p>
      ) : (
        <div className="space-y-6">
          {roomTypes.map((type) => {
            const typeImages = images.filter((img) => img.room_type === type);
            if (typeImages.length === 0) return null;
            return (
              <div key={type}>
                <h3 className="text-sm font-semibold text-foreground mb-3 capitalize">{type}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {typeImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative group bg-card border border-border overflow-hidden"
                    >
                      <img
                        src={img.image_url}
                        alt={img.alt_text}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2">
                        <p className="text-[10px] text-muted-foreground truncate">{img.alt_text}</p>
                      </div>
                      <button
                        onClick={() => deleteImage(img.id, img.image_url)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==================== DINING BANNERS ==================== */
function DiningBannersPanel({ house }: { house: string }) {
  const [banners, setBanners] = useState<DiningBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", banner_type: "setup" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", banner_type: "setup" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("dining_banners")
      .select("*")
      .eq("guest_house", house)
      .order("display_order");
    setBanners(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!form.title) return;
    await supabase.from("dining_banners").insert({
      guest_house: house,
      image_url: "",
      title: form.title,
      description: form.description,
      banner_type: form.banner_type,
      display_order: banners.length,
    });
    setForm({ title: "", description: "", banner_type: "setup" });
    setShowForm(false);
    fetchData();
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, bannerId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${house}/dining/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("dining").upload(fileName, file);
    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("dining").getPublicUrl(fileName);
    await supabase
      .from("dining_banners")
      .update({ image_url: urlData.publicUrl })
      .eq("id", bannerId);
    setUploading(false);
    fetchData();
  };

  const startEdit = (banner: DiningBanner) => {
    setEditingId(banner.id);
    setEditForm({
      title: banner.title,
      description: banner.description,
      banner_type: banner.banner_type,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await supabase.from("dining_banners").update(editForm).eq("id", editingId);
    setEditingId(null);
    fetchData();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("dining_banners").update({ is_active: !current }).eq("id", id);
    fetchData();
  };

  const deleteBanner = async (id: string, imageUrl: string) => {
    if (imageUrl) {
      const pathMatch = imageUrl.match(/dining\/(.+)$/);
      if (pathMatch) await supabase.storage.from("dining").remove([pathMatch[1]]);
    }
    await supabase.from("dining_banners").delete().eq("id", id);
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-foreground">Dining Banners</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-gold flex items-center gap-2 text-xs"
        >
          <Plus className="h-3 w-3" /> Add Banner
        </button>
      </div>
      {showForm && (
        <div className="bg-cream border border-border p-6 mb-6 space-y-4">
          <input
            type="text"
            placeholder="Banner title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          />
          <select
            value={form.banner_type}
            onChange={(e) => setForm({ ...form, banner_type: e.target.value })}
            className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          >
            <option value="setup">Dining Setup</option>
            <option value="food">Food Plate</option>
          </select>
          <button onClick={handleAdd} className="btn-gold text-xs">
            Create Banner
          </button>
        </div>
      )}
      {banners.length === 0 ? (
        <p className="text-sm text-muted-foreground">No banners yet.</p>
      ) : (
        <div className="space-y-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-card border border-border p-5">
              {editingId === banner.id ? (
                <div className="space-y-3">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark"
                  />
                  <input
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark"
                  />
                  <select
                    value={editForm.banner_type}
                    onChange={(e) => setEditForm({ ...editForm, banner_type: e.target.value })}
                    className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold-dark"
                  >
                    <option value="setup">Dining Setup</option>
                    <option value="food">Food Plate</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="text-xs px-3 py-1.5 bg-green-600 text-white flex items-center gap-1"
                    >
                      <Save className="h-3 w-3" /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs px-3 py-1.5 bg-gray-500 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{banner.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 bg-cream text-muted-foreground uppercase">
                          {banner.banner_type}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 uppercase ${banner.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {banner.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {banner.description && (
                        <p className="text-xs text-muted-foreground mt-1">{banner.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(banner)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(banner.id, banner.is_active)}
                        className={`text-xs px-2 py-1 ${banner.is_active ? "bg-yellow-600" : "bg-green-600"} text-white`}
                      >
                        {banner.is_active ? "Deact." : "Act."}
                      </button>
                      <button
                        onClick={() => deleteBanner(banner.id, banner.image_url)}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {banner.image_url ? (
                    <div className="relative group">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-40 object-cover"
                      />
                      <label className="absolute top-2 left-2 bg-charcoal/70 text-warm-white text-[10px] px-2 py-1 cursor-pointer hover:bg-charcoal transition-colors">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadImage(e, banner.id)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="block border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-gold-dark transition-colors">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Upload banner image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadImage(e, banner.id)}
                        className="hidden"
                      />
                    </label>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== MENU IMAGES ==================== */
function MenuImagesPanel({ house }: { house: string }) {
  const [menuImages, setMenuImages] = useState<MenuImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("Menu");
  const [newCaption, setNewCaption] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("menu_images")
      .select("*")
      .eq("guest_house", house)
      .order("created_at", { ascending: false });
    setMenuImages(data || []);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${house}/menu/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("menus").upload(fileName, file);
    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("menus").getPublicUrl(fileName);
    await supabase.from("menu_images").insert({
      guest_house: house,
      image_url: urlData.publicUrl,
      title: newTitle || "Menu",
      caption: newCaption || null,
    });
    setNewTitle("Menu");
    setNewCaption("");
    setUploading(false);
    fetchData();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("menu_images").update({ is_active: !current }).eq("id", id);
    fetchData();
  };

  const deleteImage = async (id: string, imageUrl: string) => {
    const pathMatch = imageUrl.match(/menus\/(.+)$/);
    if (pathMatch) await supabase.storage.from("menus").remove([pathMatch[1]]);
    await supabase.from("menu_images").delete().eq("id", id);
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Menu Images</h2>
      <p className="text-xs text-muted-foreground mb-6">
        Upload at least three menu images with captions. Guests can view and download them from the
        dining page.
      </p>
      <div className="bg-cream border border-border p-6 mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-4">Upload Menu Image</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Menu title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            className="border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-gold-dark"
          />
          <label
            className={`btn-gold flex items-center justify-center gap-2 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Choose & Upload"}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>
      {menuImages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No menu images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {menuImages.map((img) => (
            <div
              key={img.id}
              className="relative group bg-card border border-border overflow-hidden"
            >
              <img
                src={img.image_url}
                alt={img.title}
                className="w-full h-48 object-contain bg-charcoal/5"
              />
              <div className="p-3">
                <p className="text-xs font-medium text-foreground truncate">{img.title}</p>
                <span
                  className={`text-[10px] px-2 py-0.5 uppercase ${img.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {img.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleActive(img.id, img.is_active)}
                  className={`p-1.5 ${img.is_active ? "bg-yellow-600" : "bg-green-600"} text-white`}
                >
                  {img.is_active ? "Deact." : "Act."}
                </button>
                <button
                  onClick={() => deleteImage(img.id, img.image_url)}
                  className="bg-red-600 text-white p-1.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== SITE IMAGES ==================== */

type SiteImageRow = {
  id: string;
  slot_key: string;
  image_url: string;
  alt_text: string;
  display_order: number;
};

type SiteImageSlot = {
  key: string;
  label: string;
  description?: string;
  multi?: boolean;
};

// Slots shared by both guest houses (landing page & logos).
const SHARED_SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    key: "landing.hero",
    label: "Landing Page Hero",
    description: "Full-width background photo on the welcome / property-select page.",
  },
  {
    key: "landing.card.greater-heights",
    label: "Landing Card — Greater Heights",
    description: "Photo on the Greater Heights property card.",
  },
  {
    key: "landing.card.new-heights",
    label: "Landing Card — New Heights",
    description: "Photo on the New Heights property card.",
  },
  {
    key: "logo.greater-heights",
    label: "Logo — Greater Heights",
    description: "Shown in the website navbar and footer.",
  },
  {
    key: "logo.new-heights",
    label: "Logo — New Heights",
    description: "Shown in the website navbar and footer.",
  },
];

// Per-property slots. "{house}" is replaced with the selected house id.
const HOUSE_SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  { key: "{house}.home.hero", label: "Home Page Hero" },
  {
    key: "{house}.home.welcome",
    label: "Welcome Gallery",
    multi: true,
    description: "Photos shown beside the welcome text on the home page. Add as many as you like.",
  },
  { key: "{house}.home.dining_cta", label: "Home Dining Banner" },
  { key: "{house}.about.hero", label: "About Page Hero" },
  { key: "{house}.dining.hero", label: "Dining Page Hero" },
  { key: "{house}.dining.interior", label: "Dining Interior Photo" },
  {
    key: "{house}.dining.meals",
    label: "Dining Food Gallery",
    multi: true,
    description:
      "Photos shown next to the breakfast, lunch and dinner menus. Add one per meal or more.",
  },
];

const SITE_IMAGES_BUCKET = "site_images";

function getDefaultSiteImageForSlot(slotKey: string): string {
  switch (slotKey) {
    case "landing.hero":
      return ghExterior;
    case "landing.card.greater-heights":
      return ghExterior;
    case "landing.card.new-heights":
      return nhExterior1;
    case "logo.greater-heights":
      return ghLogo;
    case "logo.new-heights":
      return nhLogo;
    case "greater-heights.home.hero":
    case "greater-heights.about.hero":
      return ghExterior;
    case "new-heights.home.hero":
    case "new-heights.about.hero":
      return nhExterior1;
    case "greater-heights.home.welcome":
      return ghCoupleRoom;
    case "new-heights.home.welcome":
      return nhCoupleRoom;
    case "greater-heights.home.dining_cta":
      return ghOutdoorDining;
    case "new-heights.home.dining_cta":
      return nhDining2;
    case "greater-heights.dining.hero":
      return ghOutdoorDining;
    case "new-heights.dining.hero":
      return nhDining2;
    case "greater-heights.dining.interior":
      return diningInterior;
    case "new-heights.dining.interior":
      return diningInterior;
    case "greater-heights.dining.meals":
      return ghDining;
    case "new-heights.dining.meals":
      return nhDining1;
    default:
      return ghExterior;
  }
}

function siteImagePathFromUrl(url: string): string | null {
  const marker = `/object/public/${SITE_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const raw = url.slice(idx + marker.length);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function uploadSiteImageFile(slotKey: string, file: File): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${slotKey.replace(/[^a-z0-9-]/gi, "-")}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(SITE_IMAGES_BUCKET).upload(path, file);
  if (error) {
    alert("Upload failed: " + error.message);
    return null;
  }
  const { data } = supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function SiteImagesPanel({ house }: { house: string }) {
  const [rows, setRows] = useState<SiteImageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_images")
      .select("*")
      .order("slot_key")
      .order("display_order");
    if (!error) setRows((data as SiteImageRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading site images...</p>;

  const houseName = house === "greater-heights" ? "Greater Heights" : "New Heights";

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-gold/20 bg-gradient-to-r from-gold/8 to-transparent p-5">
        <h2 className="font-heading text-2xl text-foreground">Site Images</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          These are the live image slots used across the public website. Upload a replacement, edit
          the alt text, reorder gallery photos, or reset any slot back to its default asset.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Shared across the whole website
          </h3>
          <div className="space-y-4">
            {SHARED_SITE_IMAGE_SLOTS.map((slot) => (
              <SiteImageSlotEditor
                key={slot.key}
                slot={slot}
                slotKey={slot.key}
                rows={rows}
                onChange={reload}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {houseName} pages
          </h3>
          <div className="space-y-4">
            {HOUSE_SITE_IMAGE_SLOTS.map((slot) => (
              <SiteImageSlotEditor
                key={`${house}-${slot.key}`}
                slot={slot}
                slotKey={slot.key.replace("{house}", house)}
                rows={rows}
                onChange={reload}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteImageSlotEditor({
  slot,
  slotKey,
  rows,
  onChange,
}: {
  slot: SiteImageSlot;
  slotKey: string;
  rows: SiteImageRow[];
  onChange: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});

  const slotRows = rows
    .filter((r) => r.slot_key === slotKey)
    .sort((a, b) => a.display_order - b.display_order);
  const hasOverride = slotRows.length > 0;
  const activeImageUrl = hasOverride ? slotRows[0].image_url : getDefaultSiteImageForSlot(slotKey);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const url = await uploadSiteImageFile(slotKey, file);
    if (url) {
      if (!slot.multi && slotRows.length > 0) {
        // Singleton slot: replace the existing override in place
        const { error } = await supabase
          .from("site_images")
          .update({ image_url: url })
          .eq("id", slotRows[0].id);
        if (error) alert("Could not update image: " + error.message);
      } else {
        const nextOrder =
          slotRows.length > 0 ? Math.max(...slotRows.map((r) => r.display_order)) + 1 : 0;
        const { error } = await supabase.from("site_images").insert({
          slot_key: slotKey,
          image_url: url,
          alt_text: "",
          display_order: nextOrder,
        });
        if (error) alert("Could not save image: " + error.message);
      }
      onChange();
    }
    setUploading(false);
  };

  const handleSaveAlt = async (row: SiteImageRow) => {
    const value = altDrafts[row.id];
    if (value === undefined) return;
    const { error } = await supabase
      .from("site_images")
      .update({ alt_text: value })
      .eq("id", row.id);
    if (error) {
      alert("Could not update description: " + error.message);
      return;
    }
    setAltDrafts((p) => {
      const next = { ...p };
      delete next[row.id];
      return next;
    });
    onChange();
  };

  const handleRemove = async (row: SiteImageRow) => {
    if (!window.confirm("Remove this image? The website will show the default photo again.")) {
      return;
    }
    const { error } = await supabase.from("site_images").delete().eq("id", row.id);
    if (error) {
      alert("Could not remove image: " + error.message);
      return;
    }
    // Best-effort cleanup of the uploaded file in storage
    const path = siteImagePathFromUrl(row.image_url);
    if (path) {
      await supabase.storage.from(SITE_IMAGES_BUCKET).remove([path]);
    }
    onChange();
  };

  const handleResetToDefault = async () => {
    if (!slotRows.length) return;
    if (!window.confirm("Reset this slot to the built-in default image?")) return;

    for (const row of slotRows) {
      const { error } = await supabase.from("site_images").delete().eq("id", row.id);
      if (error) {
        alert("Could not reset image: " + error.message);
        return;
      }
      const path = siteImagePathFromUrl(row.image_url);
      if (path) {
        await supabase.storage.from(SITE_IMAGES_BUCKET).remove([path]);
      }
    }

    onChange();
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= slotRows.length) return;
    const a = slotRows[index];
    const b = slotRows[swapIndex];
    const { error: errA } = await supabase
      .from("site_images")
      .update({ display_order: b.display_order })
      .eq("id", a.id);
    const { error: errB } = await supabase
      .from("site_images")
      .update({ display_order: a.display_order })
      .eq("id", b.id);
    if (errA || errB) {
      alert("Could not reorder images.");
      return;
    }
    onChange();
  };

  return (
    <div className="rounded-[26px] border border-border bg-cream/60 p-4 shadow-[0_18px_35px_rgba(31,31,31,0.04)] md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-heading text-lg text-foreground">{slot.label}</h4>
          {slot.description && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{slot.description}</p>
          )}
        </div>
        <label
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gold-dark px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-warm-white shadow-sm transition hover:bg-gold ${
            uploading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {slot.multi ? <Plus className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
          {uploading
            ? "Uploading..."
            : slot.multi
              ? "Add Image"
              : slotRows.length > 0
                ? "Replace"
                : "Upload"}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      <div className="mb-4 rounded-2xl border border-dashed border-gold/25 bg-card/80 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Current live image
          </p>
          <span
            className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${
              hasOverride ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {hasOverride ? "override active" : "default asset"}
          </span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-charcoal/5">
          <img src={activeImageUrl} alt={slot.label} className="h-28 w-full object-cover" />
        </div>
      </div>

      {slotRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-background/50 p-3">
          <p className="text-xs italic text-muted-foreground">
            No custom image yet — the website is using its built-in photo for this slot. Upload a
            new image to override it.
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${slot.multi ? "md:grid-cols-2 xl:grid-cols-3" : "sm:flex sm:items-center"}`}
        >
          {slotRows.map((row, index) => (
            <div key={row.id} className="rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div className="relative mb-2 overflow-hidden rounded-xl bg-charcoal/5">
                <img
                  src={row.image_url}
                  alt={row.alt_text || slot.label}
                  className="h-36 w-full object-cover"
                />
              </div>
              <input
                type="text"
                placeholder="Description (alt text)"
                value={altDrafts[row.id] ?? row.alt_text}
                onChange={(e) => setAltDrafts((p) => ({ ...p, [row.id]: e.target.value }))}
                className="mb-2 w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-gold-dark focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2">
                {altDrafts[row.id] !== undefined && altDrafts[row.id] !== row.alt_text ? (
                  <button
                    onClick={() => handleSaveAlt(row)}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1.5 text-[10px] font-medium text-white transition hover:bg-emerald-500"
                  >
                    <Save className="h-3 w-3" /> Save
                  </button>
                ) : (
                  <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    #{index + 1}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  {slot.multi && (
                    <>
                      <button
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Move earlier"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleMove(index, 1)}
                        disabled={index === slotRows.length - 1}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Move later"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleResetToDefault}
                    className="rounded-lg border border-border bg-muted px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-foreground transition hover:bg-accent"
                    aria-label="Reset to default image"
                  >
                    Default
                  </button>
                  <button
                    onClick={() => handleRemove(row)}
                    className="rounded-lg bg-red-600 p-1.5 text-white transition hover:bg-red-500"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
