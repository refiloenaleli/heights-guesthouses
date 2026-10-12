import type { GuestHouse } from "@/lib/guest-house-context";

type PropertyMapProps = {
  activeHouse: GuestHouse;
  houseName: string;
};

const propertyCoordinates: Record<GuestHouse, { latitude: number; longitude: number }> = {
  "greater-heights": { latitude: -29.3271667, longitude: 27.4882778 },
  "new-heights": { latitude: -29.3167, longitude: 27.4833 },
};

export function PropertyMap({ activeHouse, houseName }: PropertyMapProps) {
  const { latitude, longitude } = propertyCoordinates[activeHouse];
  const delta = 0.012;
  const mapBounds = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join(",");
  const marker = `${latitude},${longitude}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds}&layer=mapnik&marker=${marker}`;
  const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${marker}`;

  return (
    <div className="relative h-72 min-h-64 overflow-hidden rounded-md border border-border bg-cream-dark sm:h-80">
      <iframe
        title={`${houseName} interactive map`}
        src={embedUrl}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-charcoal/90 px-4 py-2 text-xs text-white shadow-lg backdrop-blur-sm hover:bg-charcoal"
      >
        Open directions
      </a>
    </div>
  );
}
