import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import { PropertyMap } from "@/components/PropertyMap";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const { houseName, email, whatsappNumber, phoneNumber, address, activeHouse } = useGuestHouse();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Save inquiry to Supabase
    await supabase.from("contact_inquiries").insert({
      guest_house: activeHouse,
      sender_name: formData.name,
      sender_email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    // Also open mailto as fallback
    const mailTo = `mailto:${email}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
    )}`;
    window.open(mailTo);

    setSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 6000);
  };

  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello, I would like to inquire about ${houseName}.`,
  )}`;

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
        <span className="section-label text-gold-light">WE'D LOVE TO HEAR FROM YOU</span>
        <h1 className="section-title text-warm-white mt-2">Let's plan your stay.</h1>
        <p className="mt-3 max-w-xl mx-auto text-sm text-warm-white/60">
          Whether you're booking a room, planning an event or simply have a question, we're here to
          help.
        </p>
      </section>

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-2xl text-foreground mb-6">{houseName}</h2>
              <p className="font-accent mb-6 text-2xl text-gold-dark">
                {houseName.startsWith("Greater")
                  ? "For intimate stays and smaller gatherings."
                  : "For larger stays, conferences and events."}
              </p>
              <div className="space-y-5">
                <a
                  href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-3 text-sm text-foreground hover:text-gold-dark"
                  aria-label={`Call ${houseName} at ${phoneNumber}`}
                >
                  <Phone className="h-5 w-5 text-gold-dark" />
                </a>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-sm text-foreground hover:text-gold-dark"
                >
                  <Mail className="h-5 w-5 text-gold-dark" /> {email}
                </a>
                <div className="flex items-start gap-3 text-sm text-foreground">
                  <MapPin className="h-5 w-5 text-gold-dark mt-0.5" /> {address}
                </div>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 btn-gold"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>

              <div className="mt-8">
                <PropertyMap activeHouse={activeHouse} houseName={houseName} />
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <h2 className="font-heading text-2xl text-foreground mb-4">Send us a message</h2>
              {submitted ? (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Message sent successfully! We'll get back to you soon.
                </div>
              ) : (
                <>
                  {(["name", "email", "subject"] as const).map((field) => (
                    <input
                      key={field}
                      type={field === "email" ? "email" : "text"}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      required
                      value={formData[field]}
                      onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
                      className="w-full border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-dark"
                    />
                  ))}
                  <textarea
                    placeholder="Your Message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    className="w-full border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-dark resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold w-full disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </>
              )}
            </motion.form>
          </div>
        </div>
      </section>
    </>
  );
}
