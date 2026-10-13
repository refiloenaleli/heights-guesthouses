import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import { useSiteImage } from "@/lib/site-images-context";
import ghExterior from "@/assets/gh-exterior.jpg";
import ghCoupleRoom from "@/assets/gh-couple-room.jpg";
import nhExterior from "@/assets/nh-exterior1.jpg";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { houseName } = useGuestHouse();
  const firstHeroImage = useSiteImage("about.hero", ghExterior);
  const secondHeroImage = useSiteImage("about.slide.2", ghCoupleRoom);
  const thirdHeroImage = useSiteImage("about.slide.3", nhExterior);
  const slideTrackRef = useRef<HTMLDivElement>(null);
  const slides = [
    {
      image: firstHeroImage,
      alt: "Greater Heights Guest House exterior",
      property: "Greater Heights",
    },
    {
      image: secondHeroImage,
      alt: "Guest room at Greater Heights Guest House",
      property: "Greater Heights",
    },
    { image: thirdHeroImage, alt: "New Heights Guest House exterior", property: "New Heights" },
  ];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => {
        const next = (current + 1) % slides.length;
        slideTrackRef.current?.scrollTo({
          left: next * (slideTrackRef.current.clientWidth || 0),
          behavior: "smooth",
        });
        return next;
      });
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <>
      <section className="photo-hero relative min-h-[520px] overflow-hidden bg-charcoal">
        <div
          ref={slideTrackRef}
          onScroll={(event) => {
            const track = event.currentTarget;
            setActiveSlide(
              Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)),
            );
          }}
          aria-label="About the Heights properties"
          className="absolute inset-0 z-0 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        >
          {slides.map((slide) => (
            <div
              key={slide.image}
              className="relative h-full min-h-[520px] w-full shrink-0 snap-center"
            >
              <img src={slide.image} alt={slide.alt} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="photo-hero-overlay hero-overlay pointer-events-none absolute inset-0 z-[1]" />
        <div className="photo-hero-content relative z-10 mx-auto flex min-h-[520px] max-w-6xl items-end px-4 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label text-gold-light">OUR STORY</span>
            <h1 className="mt-2 max-w-3xl font-heading text-lg font-normal leading-tight text-warm-white sm:mt-3 sm:text-3xl md:text-6xl">
              Built on hospitality. Growing with purpose.
            </h1>
            <p className="mt-2 max-w-xl text-[10px] leading-tight text-warm-white/90 sm:mt-5 sm:text-sm sm:leading-relaxed md:text-base">
              Two guesthouses. One trusted group in Maseru.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label="Choose a property photo"
          >
            {slides.map((slide, index) => (
              <button
                key={`${slide.property}-${index}`}
                type="button"
                onClick={() => {
                  slideTrackRef.current?.scrollTo({
                    left: index * (slideTrackRef.current.clientWidth || 0),
                    behavior: "smooth",
                  });
                  setActiveSlide(index);
                }}
                aria-label={`Show ${slide.property} photo ${index + 1}`}
                aria-current={activeSlide === index ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all ${
                  activeSlide === index ? "w-7 bg-amber-300" : "w-2.5 bg-white/55"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
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

      <section className="bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-8 max-w-3xl">
            <span className="section-label">THE HEIGHTS GROUP</span>
            <h2 className="section-title mt-2">Two distinct properties. One trusted host.</h2>
          </div>
          <div className="max-w-4xl space-y-5 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            <p>
              Greater Heights Guest House was built up over years of dedicated hospitality and
              marketing into a trusted, consistently fully-booked address in Maseru. That success
              created the foundation for a second property, New Heights Guest House, built to extend
              the same standard of hospitality on a larger scale.
            </p>
            <p>
              Today, Greater Heights and New Heights operate together as one group, under shared
              ownership and management. The two properties are not in competition with one another —
              they are marketed together, so that a client’s needs, from an intimate weekend stay to
              a large conference, can be met from within the same trusted group. Both properties
              welcome individual guests, couples, and small stays as standard; group and event
              bookings are offered as an additional package for clients who need it.
            </p>
            <p>
              With two properties in one group, we’re able to offer options a single property can’t
              — such as hosting a large conference at New Heights while housing overflow guests at
              Greater Heights nearby.
            </p>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            You are currently exploring {houseName}.
          </p>
        </div>
      </section>
    </>
  );
}
