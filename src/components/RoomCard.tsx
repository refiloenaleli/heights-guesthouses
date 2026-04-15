import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

interface RoomCardProps {
  title: string;
  price: string;
  priceNote?: string;
  description: string;
  image: string;
  features: string[];
  index?: number;
}

export function RoomCard({ title, price, priceNote, description, image, features, index = 0 }: RoomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      viewport={{ once: true }}
      className="group bg-card overflow-hidden border border-border"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-charcoal/90 px-3 py-1.5">
          <span className="text-xs text-gold-light tracking-wider">{price}</span>
          {priceNote && <span className="text-[10px] text-warm-white/60 block">{priceNote}</span>}
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-heading text-xl text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {features.map((f) => (
            <span key={f} className="text-[10px] tracking-wider uppercase px-2 py-1 bg-cream-dark text-muted-foreground">
              {f}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Link to="/booking" className="btn-gold text-[10px] px-4 py-2">Book Now</Link>
          <Link to="/accommodation" className="btn-gold-outline text-[10px] px-4 py-2">View Room</Link>
        </div>
      </div>
    </motion.div>
  );
}
