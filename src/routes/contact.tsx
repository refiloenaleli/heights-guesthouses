import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const { houseName, email, whatsappNumber } = useGuestHouse();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailTo = `mailto:${email}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )}`;
    window.open(mailTo);
  };

  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent(
    `Hello, I would like to inquire about ${houseName}.`
  )}`;

  return (
    <>
      <section className="bg-charcoal py-20 text-center">
        <span className="section-label text-gold-light">Get In Touch</span>
        <h1 className="section-title text-warm-white mt-2">Contact Us</h1>
      </section>

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-2xl text-foreground mb-6">{houseName}</h2>
              <div className="space-y-5">
                <a href={`tel:${whatsappNumber}`} className="flex items-center gap-3 text-sm text-foreground hover:text-gold-dark">
                  <Phone className="h-5 w-5 text-gold-dark" /> {whatsappNumber}
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-gold-dark">
                  <Mail className="h-5 w-5 text-gold-dark" /> {email}
                </a>
                <div className="flex items-start gap-3 text-sm text-foreground">
                  <MapPin className="h-5 w-5 text-gold-dark mt-0.5" /> Maseru, Lesotho
                </div>
              </div>

              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 btn-gold">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>

              {/* Map Placeholder */}
              <div className="mt-8 h-48 bg-cream-dark border border-border flex items-center justify-center text-xs text-muted-foreground">
                Map placeholder — integrate Google Maps here
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
              <button type="submit" className="btn-gold w-full">Send Message</button>
            </motion.form>
          </div>
        </div>
      </section>
    </>
  );
}
