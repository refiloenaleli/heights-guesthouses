import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import { getPropertyGalleryImages } from "@/lib/site-gallery";
import { useSiteImageSet } from "@/lib/site-images-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
});

const defaultCategories = ["All", "Rooms", "Dining", "Exterior", "Interior"];
type GalleryImage = {
  src: string;
  alt: string;
  category: string;
};

function GalleryPage() {
  const { houseName, activeHouse } = useGuestHouse();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<GalleryImage[]>([]);
  const propertyDefaults = getPropertyGalleryImages(activeHouse);
  const propertyImageUrls = useSiteImageSet(
    propertyDefaults.map((image) => ({
      slotKey: `${activeHouse}.gallery.${image.key}`,
      fallback: image.src,
    })),
  );

  useEffect(() => {
    let ignore = false;
    supabase
      .from("gallery_images")
      .select("image_url, alt_text, category, guest_house")
      .eq("guest_house", activeHouse)
      .order("display_order")
      .then(({ data, error }) => {
        if (ignore) return;
        if (error || !data?.length) {
          setUploadedImages([]);
          return;
        }

        setUploadedImages(
          data.map((image) => ({
            src: image.image_url,
            alt: `${image.guest_house === "greater-heights" ? "Greater Heights" : "New Heights"} — ${image.alt_text}`,
            category: image.category,
          })),
        );
      });

    return () => {
      ignore = true;
    };
  }, [activeHouse]);

  const builtInImages = propertyDefaults.map((image, index) => ({
    src: propertyImageUrls[index],
    alt: image.alt,
    category: image.category,
  }));
  const images = [...builtInImages, ...uploadedImages];
  const categories = Array.from(
    new Set([...defaultCategories, ...images.map((image) => image.category)]),
  );
  const filtered =
    activeCategory === "All" ? images : images.filter((img) => img.category === activeCategory);

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
        <span className="section-label text-gold-light">A GLIMPSE OF THE HEIGHTS</span>
        <h1 className="section-title text-warm-white mt-2">See where you'll stay.</h1>
        <p className="mt-3 max-w-xl mx-auto text-sm text-warm-white/60">
          From quiet corners and comfortable rooms to shared tables, celebrations and conference
          spaces — take a look around.
        </p>
      </section>

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs tracking-widest uppercase transition-all ${
                  activeCategory === cat
                    ? "bg-charcoal text-warm-white"
                    : "bg-cream text-muted-foreground hover:bg-cream-dark"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((img, i) => (
              <motion.button
                key={`${img.src}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedImage(img.src)}
                className="relative group overflow-hidden aspect-square"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors flex items-end p-3">
                  <span className="text-xs text-warm-white opacity-0 group-hover:opacity-100 transition-opacity tracking-wider uppercase">
                    {img.alt}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-charcoal/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Gallery"
            className="max-h-[85vh] max-w-full object-contain"
          />
        </div>
      )}
    </>
  );
}
