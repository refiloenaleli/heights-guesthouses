import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/booking")({
  component: BookingPage,
});

const roomTypes = [
  "Single Room - M600.00",
  "Couple Room - M700.00",
  "Sharing Room - M750.00",
  "Executive Room - M850.00",
  "Conference & Banqueting",
];

function BookingPage() {
  const { houseName, whatsappNumbers, email, activeHouse } = useGuestHouse();
  const availableRoomTypes =
    activeHouse === "new-heights"
      ? roomTypes.filter((room) => !room.startsWith("Executive Room"))
      : roomTypes;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    roomType: roomTypes[0],
    guests: "1",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const bookingMessage = `Hello, I would like to book at ${houseName}.\n\nName: ${form.name}\nCheck-in: ${form.checkIn}\nCheck-out: ${form.checkOut}\nRoom: ${form.roomType}\nGuests: ${form.guests}\nPhone: ${form.phone}\n\n${form.message}`;

  const [saveError, setSaveError] = useState("");

  const saveBooking = async (): Promise<boolean> => {
    try {
      const guestsCount = parseInt(form.guests, 10);
      const { error } = await supabase.from("bookings").insert({
        guest_house: activeHouse,
        guest_name: form.name,
        guest_email: form.email,
        guest_phone: form.phone,
        check_in: form.checkIn,
        check_out: form.checkOut,
        room_type: form.roomType.split(" - ")[0],
        guests_count: Number.isNaN(guestsCount) ? 1 : guestsCount,
        special_requests: form.message || null,
      });
      if (error) throw error;
      setSaveError("");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "network error";
      setSaveError(
        `We couldn't save your booking request (${message}). You can still send it via WhatsApp or email.`,
      );
      return false;
    }
  };

  const handleWhatsApp = async (whatsappNumber: string) => {
    const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(bookingMessage)}`;
    setSubmitting(true);
    await saveBooking();
    window.location.assign(url);
    setSubmitting(false);
  };

  const handleEmail = async () => {
    const url = `mailto:${email}?subject=${encodeURIComponent(`Booking Request - ${houseName}`)}&body=${encodeURIComponent(bookingMessage)}`;
    setSubmitting(true);
    await saveBooking();
    window.location.assign(url);
    setSubmitting(false);
  };

  return (
    <>
      {/* Back to Properties */}
      <div className="bg-charcoal/95 border-b border-gold/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold-light/70 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            All Properties
          </Link>
        </div>
      </div>
      <section className="bg-charcoal px-4 pb-20 pt-36 text-center">
        <span className="section-label text-gold-light">YOUR STAY STARTS HERE</span>
        <h1 className="section-title text-warm-white mt-2">Make yourself at home.</h1>
        <p className="mt-3 max-w-xl mx-auto text-sm text-warm-white/60">
          Tell us when you're coming, what you need and which Heights feels right for you. We'll
          take care of the rest.
        </p>
      </section>

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-2xl px-4">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-8 text-center"
            >
              <h2 className="font-heading text-2xl text-foreground mb-3">
                Thank you — your stay is one step closer.
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                We've received your booking request and will be in touch to confirm the details
                shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    name: "",
                    email: "",
                    phone: "",
                    checkIn: "",
                    checkOut: "",
                    roomType: roomTypes[0],
                    guests: "1",
                    message: "",
                  });
                }}
                className="btn-gold-outline"
              >
                Make Another Booking
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-5 sm:p-8"
            >
              <div className="space-y-4">
                {saveError && (
                  <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {saveError}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground mb-1 block">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full min-w-0 border border-border bg-background px-3 py-3 text-sm text-foreground caret-gold placeholder:text-muted-foreground focus:outline-none focus:border-gold-dark sm:px-4"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground mb-1 block">
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full min-w-0 border border-border bg-background px-3 py-3 text-sm text-foreground caret-gold placeholder:text-muted-foreground focus:outline-none focus:border-gold-dark sm:px-4"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground mb-1 block">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full min-w-0 border border-border bg-background px-3 py-3 text-sm text-foreground caret-gold placeholder:text-muted-foreground focus:outline-none focus:border-gold-dark sm:px-4"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground mb-1 block">
                      Check-in
                    </label>
                    <input
                      name="checkIn"
                      type="date"
                      value={form.checkIn}
                      onChange={handleChange}
                      required
                      className="w-full min-w-0 border border-border bg-background px-3 py-3 text-sm text-foreground caret-gold focus:outline-none focus:border-gold-dark sm:px-4"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground mb-1 block">
                      Check-out
                    </label>
                    <input
                      name="checkOut"
                      type="date"
                      value={form.checkOut}
                      onChange={handleChange}
                      required
                      className="w-full min-w-0 border border-border bg-background px-3 py-3 text-sm text-foreground caret-gold focus:outline-none focus:border-gold-dark sm:px-4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground mb-1 block">
                      Room Type
                    </label>
                    <select
                      name="roomType"
                      value={form.roomType}
                      onChange={handleChange}
                      className="w-full min-w-0 border border-border bg-background px-3 py-3 text-sm text-foreground focus:outline-none focus:border-gold-dark sm:px-4"
                    >
                      {availableRoomTypes.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground mb-1 block">
                      Guests
                    </label>
                    <select
                      name="guests"
                      value={form.guests}
                      onChange={handleChange}
                      className="w-full min-w-0 border border-border bg-background px-3 py-3 text-sm text-foreground focus:outline-none focus:border-gold-dark sm:px-4"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground mb-1 block">
                    Special Requests
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full min-w-0 resize-y border border-border bg-background px-3 py-3 text-sm text-foreground caret-gold placeholder:text-muted-foreground focus:outline-none focus:border-gold-dark sm:px-4"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  {whatsappNumbers.map((whatsappNumber) => (
                    <button
                      key={whatsappNumber}
                      onClick={() => handleWhatsApp(whatsappNumber)}
                      type="button"
                      disabled={submitting || !form.name || !form.email || !form.phone || !form.checkIn || !form.checkOut}
                      className="flex-1 btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      WhatsApp {whatsappNumber}
                    </button>
                  ))}
                  <button
                    onClick={handleEmail}
                    type="button"
                    disabled={submitting || !form.name || !form.email || !form.phone || !form.checkIn || !form.checkOut}
                    className="flex-1 btn-gold-outline disabled:opacity-50"
                  >
                    Book via Email
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
