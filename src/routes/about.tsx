import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import ghExterior from "@/assets/gh-exterior.jpg";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { houseName } = useGuestHouse();

  return (
    <>
      <section className="relative min-h-[520px] overflow-hidden bg-charcoal">
        <img
          src={ghExterior}
          alt="Heights Guest Houses"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-6xl items-end px-4 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label text-gold-light">OUR STORY</span>
            <h1 className="mt-3 max-w-3xl font-heading text-4xl font-normal text-warm-white md:text-6xl">
              Built on hospitality. Growing with purpose.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-warm-white/80 md:text-base">
              From one trusted address in Maseru to two homes serving guests, families, businesses
              and events.
            </p>
          </motion.div>
        </div>
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
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-5xl gap-12 px-4 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <span className="section-label">THE HEIGHTS GROUP</span>
          <div>
            <h2 className="section-title mb-5">Two distinct properties. One trusted host.</h2>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Greater Heights and New Heights operate together as one group, under shared ownership
              and management. Each property has its own character and capacity, giving guests a
              choice suited to the size and nature of their stay or event.
            </p>
            <p className="font-accent mt-8 text-2xl text-gold-dark">
              Two properties. One standard of care.
            </p>
            <p className="mt-8 text-xs text-muted-foreground">
              You are currently exploring {houseName}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
