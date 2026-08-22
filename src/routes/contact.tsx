import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const { houseName, email, whatsappNumber, phoneNumber, address } = useGuestHouse();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailTo = `mailto:${email}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
    )}`;
    window.open(mailTo);
  };

  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent(
    `Hello, I would like to inquire about ${houseName}.`,
  )}`;

  return (
    <>
      <section className="bg-charcoal py-20 text-center">
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
              <p className="font-accent mb-6 text-xl text-gold-dark">
                {houseName.startsWith("Greater")
                  ? "For intimate stays and smaller gatherings."
                  : "For larger stays, conferences and events."}
              </p>
              <div className="space-y-5">
                <a
                  href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-3 text-sm text-foreground hover:text-gold-dark"
                >
                  <Phone className="h-5 w-5 text-gold-dark" /> {phoneNumber}
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

              {/* Google Map */}
              <div className="mt-8 h-48 bg-cream-dark border border-border overflow-hidden">
                <iframe
                  title="Guest House Location"
                  src="https://www.google.com/maps?q=29.3271667,27.4882778&z=15&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
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
              <button type="submit" className="btn-gold w-full">
                Send Message
              </button>
            </motion.form>
          </div>
        </div>
      </section>
    </>
  );
}
