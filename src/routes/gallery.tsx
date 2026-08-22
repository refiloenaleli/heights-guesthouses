import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGuestHouse } from "@/lib/guest-house-context";
import { supabase } from "@/integrations/supabase/client";
import ghSingleRoom from "@/assets/gh-single-room.jpg";
import ghCoupleRoom from "@/assets/gh-couple-room.jpg";
import ghSharingRoom from "@/assets/gh-sharing-room.jpg";
import ghDining from "@/assets/gh-dining.jpg";
import ghExterior from "@/assets/gh-exterior.jpg";
import ghStaircase from "@/assets/gh-staircase.jpg";
import ghOutdoorDining from "@/assets/gh-outdoor-dining.jpg";
import nhExterior1 from "@/assets/nh-exterior1.jpg";
import nhExterior2 from "@/assets/nh-exterior2.jpg";
import nhExterior3 from "@/assets/nh-exterior3.jpg";
import nhSingleRoom from "@/assets/nh-single-room.jpg";
import nhCoupleRoom from "@/assets/nh-couple-room.jpg";
import nhSharingRoom from "@/assets/nh-sharing-room.jpg";
import nhDining1 from "@/assets/nh-dining1.jpg";
import nhDining2 from "@/assets/nh-dining2.jpg";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
});

const greaterHeightsImages = [
  { src: ghExterior, alt: "Greater Heights Exterior", category: "Exterior" },
  { src: ghCoupleRoom, alt: "Couple Suite", category: "Rooms" },
  { src: ghSingleRoom, alt: "Single Room", category: "Rooms" },
  { src: ghSharingRoom, alt: "Sharing Room", category: "Rooms" },
  { src: ghDining, alt: "Banqueting Hall", category: "Dining" },
  { src: ghOutdoorDining, alt: "Outdoor Dining", category: "Dining" },
  { src: ghStaircase, alt: "Grand Staircase", category: "Interior" },
];

const newHeightsImages = [
  { src: nhExterior1, alt: "New Heights Front View", category: "Exterior" },
  { src: nhExterior2, alt: "New Heights Side View", category: "Exterior" },
  { src: nhExterior3, alt: "New Heights Building", category: "Exterior" },
  { src: nhSingleRoom, alt: "Single Room", category: "Rooms" },
  { src: nhCoupleRoom, alt: "Couple Suite", category: "Rooms" },
  { src: nhSharingRoom, alt: "Sharing Room", category: "Rooms" },
  { src: nhDining1, alt: "Restaurant Ambiance", category: "Dining" },
  { src: nhDining2, alt: "Dining Area", category: "Dining" },
];

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

  useEffect(() => {
    let ignore = false;

    supabase
      .from("gallery_images")
      .select("image_url, alt_text, category")
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
            alt: `${houseName} — ${image.alt_text}`,
            category: image.category,
          })),
        );
      });

    return () => {
      ignore = true;
    };
  }, [activeHouse, houseName]);

  const fallbackImages =
    activeHouse === "greater-heights" ? greaterHeightsImages : newHeightsImages;
  const images = uploadedImages.length > 0 ? uploadedImages : fallbackImages;
  const categories = Array.from(
    new Set([...defaultCategories, ...images.map((img) => img.category)]),
  );
  const filtered =
    activeCategory === "All" ? images : images.filter((img) => img.category === activeCategory);

  return (
    <>
      <section className="bg-charcoal py-20 text-center">
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
                key={img.alt}
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
