import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: {
    id: string;
    room_type: string;
    price: string;
    price_note?: string;
    description: string;
    long_description?: string;
    bed_info?: string;
    features: string[];
    image: string;
  };
  activeHouse: string;
}

export function RoomModal({ isOpen, onClose, room, activeHouse }: RoomModalProps) {
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      // Fetch additional room images from database
      supabase
        .from("room_images")
        .select("image_url")
        .eq("guest_house", activeHouse)
        .eq("room_type", room.room_type)
        .order("display_order")
        .then(({ data }) => {
          const urls = data?.map((d) => d.image_url).filter(Boolean) || [];
          // Always include the main image first
          setRoomImages([room.image, ...urls]);
        });
    }
  }, [isOpen, activeHouse, room.room_type, room.image]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-charcoal/80 text-warm-white p-2 hover:bg-charcoal transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image gallery */}
            {roomImages.length > 0 && (
              <div className="relative h-[300px] md:h-[400px] bg-charcoal overflow-hidden">
                <img
                  src={roomImages[currentImageIndex]}
                  alt={`${room.room_type} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Image navigation */}
                {roomImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-charcoal/60 text-warm-white p-2 hover:bg-charcoal/80 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-charcoal/60 text-warm-white p-2 hover:bg-charcoal/80 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {roomImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            i === currentImageIndex ? "bg-gold" : "bg-warm-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Room details */}
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-heading text-2xl md:text-3xl text-foreground">
                    {room.room_type}
                  </h2>
                  <div className="mt-2">
                    <span className="text-xl font-heading text-gold-dark">{room.price}</span>
                    {room.price_note && (
                      <span className="text-xs text-muted-foreground ml-2">{room.price_note}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bed info */}
              {room.bed_info && (
                <div className="bg-cream border border-border p-4 mb-4">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">Bed Configuration:</span> {room.bed_info}
                  </p>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  About This Room
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {room.long_description || room.description}
                </p>
              </div>

              {/* Features */}
              {room.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                    Amenities & Features
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {room.features.map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 bg-gold-dark rounded-full shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <a href="/booking" className="btn-gold text-xs px-6 py-3">
                  Book This Room
                </a>
                <button onClick={onClose} className="btn-gold-outline text-xs px-6 py-3">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
