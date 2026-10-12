// Admin — Booking & Guest Tracker
// Visual calendar, today's action list, guest profiles and guest messaging.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Mail,
  Search,
  Send,
  Star,
  Users,
  X,
} from "lucide-react";

type Booking = Tables<"bookings">;
type RoomPrice = Tables<"room_prices">;
type Contact = Tables<"contact_settings">;

/* ==================== helpers ==================== */

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function todayKey() {
  return dateKey(new Date());
}
function toDate(s: string) {
  return new Date(`${s}T00:00:00`);
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function nightsBetween(checkIn: string, checkOut: string) {
  const a = toDate(checkIn);
  const b = toDate(checkOut);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}
function parsePrice(p: string) {
  const v = parseFloat(p.replace(/[^0-9.]/g, ""));
  return isNaN(v) ? 0 : v;
}
function formatMoney(v: number) {
  return v > 0 ? `M${v.toFixed(2)}` : "—";
}
function houseName(house: string) {
  return house === "greater-heights" ? "Greater Heights Guest House" : "New Heights Guest House";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const BLOCK_COLORS: Record<string, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-emerald-500",
  completed: "bg-sky-600",
  cancelled: "bg-rose-400",
};

/* ==================== message templates ==================== */

function buildConfirmationMessage(
  b: Booking,
  c: Contact | null,
  siteOrigin: string,
): { subject: string; body: string } {
  const nights = nightsBetween(b.check_in, b.check_out);
  const address = c?.address || "Maseru, Lesotho";
  const phone = c?.phone || "";
  const name = houseName(b.guest_house);
  const label = b.guest_house === "greater-heights" ? "Greater Heights" : "New Heights";
  const subject = `Booking Confirmation — ${label} (${b.room_type})`;
  const body = [
    `Hi ${b.guest_name},`,
    ``,
    `Thank you for booking a ${b.room_type} at ${name}. Your reservation is confirmed.`,
    ``,
    `📅 Check-in: ${b.check_in} (from 2:00 PM)`,
    `📅 Check-out: ${b.check_out} (by 11:00 AM)`,
    `👥 Guests: ${b.guests_count}${nights > 0 ? ` · ${nights} night(s)` : ""}`,
    b.special_requests ? `📝 Special requests: ${b.special_requests}` : "",
    ``,
    `📍 Address: ${address}`,
    `📞 Phone: ${phone}`,
    ``,
    `🧭 Directions: Open your Maps app and search for "${label}, ${address}". ` +
      `On arrival, ring the bell or call ${phone} and our team will welcome you.`,
    ``,
    `We look forward to hosting you!`,
    ``,
    `— The ${label} team`,
  ];
  return { subject, body: body.filter(Boolean).join("\n") };
}

function buildReviewMessage(b: Booking, siteOrigin: string): { subject: string; body: string } {
  const label = b.guest_house === "greater-heights" ? "Greater Heights" : "New Heights";
  const subject = `How was your stay at ${label}?`;
  const body = [
    `Hi ${b.guest_name},`,
    ``,
    `Thank you for staying with us at ${label}. We'd love to hear about your experience — please leave us a review here:`,
    ``,
    `${siteOrigin}/reviews`,
    ``,
    `Your feedback helps us keep improving, and we appreciate it very much!`,
    ``,
    `— The ${label} team`,
  ].join("\n");
  return { subject, body };
}

function emailHref(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function whatsappHref(phone: string, body: string) {
  const digits = (phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Message copied to clipboard — paste it anywhere.");
      })
      .catch(() => {
        window.prompt("Copy the message below:", text);
      });
  } else {
    window.prompt("Copy the message below:", text);
  }
}
/* ==================== CALENDAR + TODAY'S ACTIONS ==================== */

export function CalendarPanel({ house }: { house: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [prices, setPrices] = useState<RoomPrice[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<Booking | null>(null);
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: bookingRows } = await supabase
      .from("bookings")
      .select("*")
      .eq("guest_house", house)
      .order("check_in");
    const { data: priceRows } = await supabase
      .from("room_prices")
      .select("*")
      .eq("guest_house", house);
    const { data: contactRow } = await supabase
      .from("contact_settings")
      .select("*")
      .eq("guest_house", house)
      .single();
    setBookings(bookingRows || []);
    setPrices(priceRows || []);
    setContact(contactRow || null);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nowDate = new Date();
  const base = new Date(nowDate.getFullYear(), nowDate.getMonth() + monthOffset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const dim = daysInMonth(year, month);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month, dim, 23, 59, 59);
  const today = todayKey();
  const isCurrentMonth =
    base.getFullYear() === nowDate.getFullYear() && base.getMonth() === nowDate.getMonth();

  const roomSet = [
    ...new Set([...(prices || []).map((p) => p.room_type), ...bookings.map((b) => b.room_type)]),
  ];
  const pricePerNight = new Map<string, number>();
  (prices || []).forEach((p) => pricePerNight.set(p.room_type, parsePrice(p.price)));

  function barsForRoom(room: string) {
    const bars: { booking: Booking; start: number; end: number }[] = [];
    for (const b of bookings) {
      if (b.room_type !== room || b.status === "cancelled") continue;
      const ci = toDate(b.check_in);
      const co = toDate(b.check_out);
      if (co <= monthStart || ci > monthEnd) continue;
      const s = ci < monthStart ? 1 : ci.getDate();
      const e = co > monthEnd ? dim : co.getDate() - 1;
      if (e < s) continue;
      bars.push({ booking: b, start: s - 1, end: e - 1 });
    }
    bars.sort((a, z) => a.start - z.start);
    return bars;
  }

  function estBill(b: Booking) {
    return nightsBetween(b.check_in, b.check_out) * (pricePerNight.get(b.room_type) || 0);
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    await fetchData();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading calendar…</p>;

  const checkIns = bookings.filter((b) => b.check_in === today && b.status !== "cancelled");
  const checkOuts = bookings.filter((b) => b.check_out === today && b.status !== "cancelled");

  return (
    <div>
      {/* ---------- Today's Action List ---------- */}
      <section className="rounded-2xl border border-border/80 bg-cream p-5 mb-6">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-gold-dark" />
          <h2 className="font-heading text-lg text-foreground">Today's Action List — {today}</h2>
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-2">
              ✓ Arrivals / Check-ins ({checkIns.length})
            </h3>
            {checkIns.length === 0 ? (
              <p className="text-xs text-muted-foreground">No arrivals today.</p>
            ) : (
              <div className="space-y-2">
                {checkIns.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {b.guest_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {b.room_type} · {b.guests_count} guest(s) · {b.guest_phone}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelected(b)}
                      className="shrink-0 text-[10px] px-2.5 py-1 rounded-md bg-gold/15 text-gold-dark hover:bg-gold/25"
                    >
                      Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
              ✓ Departures / Check-outs ({checkOuts.length})
            </h3>
            {checkOuts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No departures today.</p>
            ) : (
              <div className="space-y-2">
                {checkOuts.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {b.guest_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {b.room_type} · Est. bill: {formatMoney(estBill(b))}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelected(b)}
                      className="shrink-0 text-[10px] px-2.5 py-1 rounded-md bg-gold/15 text-gold-dark hover:bg-gold/25"
                    >
                      Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      {/* ---------- Month Calendar ---------- */}
      <section className="rounded-2xl border border-border/80 bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setMonthOffset(monthOffset - 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs hover:border-gold-dark"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <h2 className="font-heading text-2xl text-foreground">
            {new Date(year, month, 1).toLocaleString("en-US", { month: "long" })} {year}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMonthOffset(0)}
              className="rounded-lg border border-gold/25 bg-gold/10 px-3 py-2 text-xs text-gold-dark hover:bg-gold/15"
            >
              Today
            </button>
            <button
              onClick={() => setMonthOffset(monthOffset + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs hover:border-gold-dark"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex min-w-[820px] flex-col">
            {/* header row */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `minmax(150px, 210px) repeat(${dim}, minmax(42px, 1fr))`,
                gridTemplateRows: "minmax(34px, auto)",
              }}
            >
              <div
                className="bg-muted px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                style={{ gridColumn: 1, gridRow: 1 }}
              >
                Room
              </div>
              {Array.from({ length: dim }, (_, i) => {
                const d = new Date(year, month, i + 1);
                const isToday = isCurrentMonth && d.getDate() === nowDate.getDate();
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center leading-none ${
                      isToday ? "bg-gold/15 text-gold-dark" : "bg-muted/60 text-muted-foreground"
                    }`}
                    style={{ gridColumn: i + 2, gridRow: 1 }}
                  >
                    <span className="text-[11px] font-semibold">{i + 1}</span>
                    <span className="text-[8px] uppercase">{WEEKDAYS[d.getDay()]}</span>
                  </div>
                );
              })}
            </div>
            {/* room rows */}
            {roomSet.map((room) => {
              const bars = barsForRoom(room);
              const roomToday =
                isCurrentMonth &&
                bars.some(
                  (bar) => bar.booking.check_in === today || bar.booking.check_out === today,
                );
              return (
                <div
                  key={room}
                  className="grid"
                  style={{
                    gridTemplateColumns: `minmax(150px, 210px) repeat(${dim}, minmax(42px, 1fr))`,
                    gridTemplateRows: "minmax(34px, auto)",
                  }}
                >
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold capitalize truncate ${
                      roomToday ? "text-gold-dark" : "text-foreground"
                    }`}
                    style={{ gridColumn: 1, gridRow: 1 }}
                  >
                    {room}
                    {roomToday && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                  </div>
                  {Array.from({ length: dim }, (_, i) => {
                    const d = new Date(year, month, i + 1);
                    const isToday = isCurrentMonth && d.getDate() === nowDate.getDate();
                    return (
                      <div
                        key={i}
                        className={isToday ? "bg-gold/10" : "bg-charcoal/4"}
                        style={{ gridColumn: i + 2, gridRow: 1 }}
                      />
                    );
                  })}
                  {bars.map((bar) => (
                    <button
                      key={bar.booking.id}
                      onClick={() => setSelected(bar.booking)}
                      title={`${bar.booking.guest_name} — ${bar.booking.check_in} → ${bar.booking.check_out} (${bar.booking.status})`}
                      className={`h-full rounded-sm ${BLOCK_COLORS[bar.booking.status] || "bg-gray-400"}`}
                      style={{ gridColumn: `${bar.start + 2} / ${bar.end + 3}`, gridRow: 1 }}
                    />
                  ))}
                </div>
              );
            })}

            {roomSet.length === 0 && (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                No rooms found. Add rooms under Prices first.
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-[10px] text-muted-foreground">
            Each block is a booking in that room. Click a block for guest details:
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> confirmed
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> pending
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-600" /> completed
          </span>
        </div>
      </section>

      <BookingDetailModal
        booking={selected}
        contact={contact}
        siteOrigin={siteOrigin}
        estBill={selected ? estBill(selected) : 0}
        onClose={() => setSelected(null)}
        onStatus={(id, status) => updateStatus(id, status)}
      />
    </div>
  );
}
/* ---------- shared booking detail modal ---------- */

export function BookingDetailModal({
  booking,
  contact,
  siteOrigin,
  estBill: bill,
  onClose,
  onStatus,
}: {
  booking: Booking | null;
  contact: Contact | null;
  siteOrigin: string;
  estBill: number;
  onClose: () => void;
  onStatus: (id: string, status: string) => void;
}) {
  if (!booking) return null;
  const nights = nightsBetween(booking.check_in, booking.check_out);
  const confirmMsg = buildConfirmationMessage(booking, contact, siteOrigin);
  const reviewMsg = buildReviewMessage(booking, siteOrigin);
  const label = booking.guest_house === "greater-heights" ? "Greater Heights" : "New Heights";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border/80 bg-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gold-dark" />
              <h3 className="font-heading text-xl text-foreground truncate">
                {booking.guest_name}
              </h3>
            </div>
            <span
              className={`mt-1 inline-block text-[10px] px-2 py-0.5 uppercase tracking-wider font-medium ${
                STATUS_BADGE[booking.status] || "bg-gray-100 text-gray-500"
              }`}
            >
              {booking.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-muted p-2 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-foreground">
          <p>
            <span className="text-muted-foreground">Property:</span> {label}
          </p>
          <p>
            <span className="text-muted-foreground">Room:</span> {booking.room_type}
          </p>
          <p>
            <span className="text-muted-foreground">Stay:</span> {booking.check_in} →{" "}
            {booking.check_out}
            {nights > 0 ? ` (${nights} night${nights === 1 ? "" : "s"})` : ""}
          </p>
          <p>
            <span className="text-muted-foreground">Guests:</span> {booking.guests_count}
          </p>
          <p>
            <span className="text-muted-foreground">Est. bill:</span>{" "}
            <span className="font-semibold text-gold-dark">{formatMoney(bill)}</span>
          </p>
          <a href={`mailto:${booking.guest_email}`} className="break-all">
            <Mail className="mr-1.5 inline h-3.5 w-3.5 text-muted-foreground" />
            {booking.guest_email}
          </a>
          <p className="break-all">{booking.guest_phone}</p>
          {booking.special_requests && (
            <p className="italic text-muted-foreground">"{booking.special_requests}"</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {booking.status === "pending" && (
            <button
              onClick={() => onStatus(booking.id, "confirmed")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs"
            >
              <Check className="h-3.5 w-3.5" /> Confirm
            </button>
          )}
          {booking.status === "confirmed" && (
            <button
              onClick={() => onStatus(booking.id, "completed")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-600 text-white text-xs"
            >
              <Check className="h-3.5 w-3.5" /> Mark completed
            </button>
          )}
          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <button
              onClick={() => onStatus(booking.id, "cancelled")}
              className="px-3 py-2 bg-red-600 text-white text-xs"
            >
              Cancel
            </button>
          )}
        </div>
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Send confirmation — check-in info, directions & contact
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={emailHref(booking.guest_email, confirmMsg.subject, confirmMsg.body)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gold-dark text-warm-white text-xs"
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
            <a
              href={whatsappHref(booking.guest_phone, confirmMsg.body)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs"
            >
              <Send className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <button
              onClick={() => copyText(confirmMsg.body)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-border bg-muted text-xs"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer select-none text-[10px] text-muted-foreground">
              Preview message
            </summary>
            <pre className="mt-1.5 whitespace-pre-wrap rounded-lg border border-border bg-charcoal/5 p-3 text-[11px] text-muted-foreground">
              {confirmMsg.body}
            </pre>
          </details>

          {booking.status === "completed" && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Post-stay — request a review
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={emailHref(booking.guest_email, reviewMsg.subject, reviewMsg.body)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-gold-dark text-warm-white text-xs"
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
                <a
                  href={whatsappHref(booking.guest_phone, reviewMsg.body)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs"
                >
                  <Send className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <button
                  onClick={() => copyText(reviewMsg.body)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-border bg-muted text-xs"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/* ==================== GUEST PROFILES ==================== */

export function GuestProfilesPanel({ house }: { house: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [prices, setPrices] = useState<RoomPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: bookingRows } = await supabase
      .from("bookings")
      .select("*")
      .eq("guest_house", house)
      .order("check_in", { ascending: false });
    const { data: priceRows } = await supabase
      .from("room_prices")
      .select("*")
      .eq("guest_house", house);
    setBookings(bookingRows || []);
    setPrices(priceRows || []);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pricePerNight = new Map<string, number>();
  (prices || []).forEach((p) => pricePerNight.set(p.room_type, parsePrice(p.price)));

  const q = query.trim().toLowerCase();
  const filtered = q
    ? bookings.filter((b) =>
        `${b.guest_name} ${b.guest_email} ${b.guest_phone}`.toLowerCase().includes(q),
      )
    : bookings;

  const groups = new Map<string, Booking[]>();
  for (const b of filtered) {
    const list = groups.get(b.guest_email) || [];
    list.push(b);
    groups.set(b.guest_email, list);
  }
  const guests = [...groups.entries()]
    .map(([email, list]) => ({
      email,
      name: list[0].guest_name,
      phone: list[0].guest_phone,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const selectedGuest = selectedEmail
    ? bookings.filter((b) => b.guest_email === selectedEmail)
    : [];
  const selectedGuestInfo =
    selectedGuest.length > 0
      ? {
          name: selectedGuest[0].guest_name,
          email: selectedGuest[0].guest_email,
          phone: selectedGuest[0].guest_phone,
        }
      : null;
  if (loading) return <p className="text-muted-foreground text-sm">Loading guest profiles…</p>;

  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-2">Guest Profiles</h2>
      <p className="text-xs text-muted-foreground mb-6">
        Search past guests to see their contact details and booking history.
      </p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-full border border-border bg-card py-2.5 pl-10 pr-3 text-sm focus:border-gold-dark focus:outline-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Guests ({guests.length})
          </h3>
          {guests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No guests match your search.</p>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto">
              {guests.map((g) => {
                const stays = groups.get(g.email) || [];
                const latest = stays[0];
                return (
                  <button
                    key={g.email}
                    onClick={() => setSelectedEmail(g.email)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left ${
                      selectedEmail === g.email
                        ? "border-gold/40 bg-gold/8"
                        : "border-border bg-card hover:border-gold/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {g.name}
                      </span>
                      <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {stays.length} stay{stays.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
                      {g.email} · {g.phone}
                    </div>
                    {latest && (
                      <div className="text-[10px] text-muted-foreground">
                        Last stay: {latest.check_in} → {latest.check_out} ({latest.room_type})
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Booking history
          </h3>
          {!selectedGuestInfo ? (
            <p className="text-sm text-muted-foreground">
              Select a guest on the left to see their history.
            </p>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold-dark" />
                <h4 className="font-heading text-lg text-foreground">{selectedGuestInfo.name}</h4>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selectedGuestInfo.email} · {selectedGuestInfo.phone}
              </p>
              <a
                href={`mailto:${selectedGuestInfo.email}`}
                className="mt-2 inline-flex items-center gap-1.5 border border-gold/25 bg-gold/10 px-3 py-2 text-xs text-gold-dark"
              >
                <Mail className="h-3.5 w-3.5" /> Email guest
              </a>

              <div className="mt-4 space-y-3">
                {selectedGuest.map((b) => {
                  const nights = nightsBetween(b.check_in, b.check_out);
                  const bill = nights * (pricePerNight.get(b.room_type) || 0);
                  return (
                    <div key={b.id} className="rounded-lg border border-border bg-charcoal/4 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">{b.room_type}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 uppercase ${STATUS_BADGE[b.status] || ""}`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {b.check_in} → {b.check_out} · {b.guests_count} guest(s)
                        {nights > 0 ? ` · ${nights} night(s)` : ""}
                        {bill > 0 ? ` · ${formatMoney(bill)}` : ""}
                      </p>
                      {b.special_requests && (
                        <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                          "{b.special_requests}"
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <a
                          href={emailHref(
                            b.guest_email,
                            "Booking Confirmation",
                            buildConfirmationMessage(b, null, siteOrigin).body,
                          )}
                          className="text-[10px] px-2 py-1 rounded-md bg-gold/15 text-gold-dark hover:bg-gold/25"
                        >
                          Confirmation
                        </a>
                        <a
                          href={whatsappHref(
                            b.guest_phone,
                            buildConfirmationMessage(b, null, siteOrigin).body,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] px-2 py-1 rounded-md bg-green-600/15 text-green-700 hover:bg-green-600/25"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/* ==================== MESSAGING ==================== */

export function MessagingPanel({ house }: { house: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"confirmation" | "review">("confirmation");
  const [selectedId, setSelectedId] = useState<string>("");
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: bookingRows } = await supabase
      .from("bookings")
      .select("*")
      .eq("guest_house", house)
      .order("created_at", { ascending: false });
    const { data: contactRow } = await supabase
      .from("contact_settings")
      .select("*")
      .eq("guest_house", house)
      .single();
    setBookings(bookingRows || []);
    setContact(contactRow || null);
    setLoading(false);
  }, [house]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const candidates =
    mode === "review" ? bookings.filter((b) => b.status === "completed") : bookings;
  const selected = candidates.find((b) => b.id === selectedId) || candidates[0] || null;
  if (!selectedId && selected) setSelectedId(selected.id);

  const msg = selected
    ? mode === "review"
      ? buildReviewMessage(selected, siteOrigin)
      : buildConfirmationMessage(selected, contact, siteOrigin)
    : null;

  if (loading) return <p className="text-muted-foreground text-sm">Loading messages…</p>;

  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-2">Guest Messaging</h2>
      <p className="text-xs text-muted-foreground mb-6">
        Generate a ready-to-send confirmation (check-in info & directions) or a post-stay review
        request.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(["confirmation", "review"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setSelectedId("");
              }}
              className={`rounded-lg border px-3 py-2 text-xs capitalize ${
                mode === m
                  ? "border-gold/40 bg-gold-dark text-warm-white"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {m === "confirmation" ? "Confirmation" : "Review request"}
            </button>
          ))}
        </div>
        <select
          value={selected?.id || ""}
          onChange={(e) => setSelectedId(e.target.value)}
          className="max-w-xs border border-border bg-card px-3 py-2 text-xs focus:border-gold-dark"
        >
          {candidates.length === 0 && <option value="">No bookings yet</option>}
          {candidates.map((b) => (
            <option key={b.id} value={b.id}>
              {b.guest_name} · {b.room_type} · {b.check_in} → {b.check_out}
            </option>
          ))}
        </select>
      </div>
      {!selected || !msg ? (
        <p className="text-sm text-muted-foreground">
          {mode === "review"
            ? "Mark a booking as completed to send a review request."
            : "No bookings to message yet."}
        </p>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gold-dark" />
            <h3 className="font-heading text-lg text-foreground">
              {mode === "confirmation" ? "Booking Confirmation" : "Review Request"} —{" "}
              {selected.guest_name}
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            To: {selected.guest_email} · {selected.guest_phone}
          </p>

          <pre className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-charcoal/5 p-4 text-xs text-muted-foreground">
            {msg.body}
          </pre>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={emailHref(selected.guest_email, msg.subject, msg.body)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gold-dark text-warm-white text-xs"
            >
              <Mail className="h-3.5 w-3.5" /> Send via Email
            </a>
            <a
              href={whatsappHref(selected.guest_phone, msg.body)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white text-xs"
            >
              <Send className="h-3.5 w-3.5" /> Send via WhatsApp
            </a>
            <button
              onClick={() => copyText(msg.body)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-border bg-muted text-xs"
            >
              <Copy className="h-3.5 w-3.5" /> Copy message
            </button>
          </div>
          {mode === "review" && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              The review link points to {siteOrigin}/reviews — guests can leave a rating and comment
              there.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
