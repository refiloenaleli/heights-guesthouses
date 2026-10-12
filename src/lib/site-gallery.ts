import type { GuestHouse } from "@/lib/guest-house-context";
import ghCoupleRoom from "@/assets/gh-couple-room.jpg";
import ghDining from "@/assets/gh-dining.jpg";
import ghExterior from "@/assets/gh-exterior.jpg";
import ghOutdoorDining from "@/assets/gh-outdoor-dining.jpg";
import ghSharingRoom from "@/assets/gh-sharing-room.jpg";
import ghSingleRoom from "@/assets/gh-single-room.jpg";
import ghStaircase from "@/assets/gh-staircase.jpg";
import nhCoupleRoom from "@/assets/nh-couple-room.jpg";
import nhDining1 from "@/assets/nh-dining1.jpg";
import nhDining2 from "@/assets/nh-dining2.jpg";
import nhExterior1 from "@/assets/nh-exterior1.jpg";
import nhExterior2 from "@/assets/nh-exterior2.jpg";
import nhExterior3 from "@/assets/nh-exterior3.jpg";
import nhSharingRoom from "@/assets/nh-sharing-room.jpg";
import nhSingleRoom from "@/assets/nh-single-room.jpg";

export type PropertyGalleryImage = {
  key: string;
  src: string;
  alt: string;
  category: string;
};

const propertyGallery: Record<GuestHouse, PropertyGalleryImage[]> = {
  "greater-heights": [
    { key: "exterior", src: ghExterior, alt: "Greater Heights Exterior", category: "Exterior" },
    { key: "couple-room", src: ghCoupleRoom, alt: "Couple Suite", category: "Rooms" },
    { key: "single-room", src: ghSingleRoom, alt: "Single Room", category: "Rooms" },
    { key: "sharing-room", src: ghSharingRoom, alt: "Sharing Room", category: "Rooms" },
    { key: "banqueting-hall", src: ghDining, alt: "Banqueting Hall", category: "Dining" },
    { key: "outdoor-dining", src: ghOutdoorDining, alt: "Outdoor Dining", category: "Dining" },
    { key: "staircase", src: ghStaircase, alt: "Grand Staircase", category: "Interior" },
  ],
  "new-heights": [
    { key: "exterior-front", src: nhExterior1, alt: "New Heights Front View", category: "Exterior" },
    { key: "exterior-side", src: nhExterior2, alt: "New Heights Side View", category: "Exterior" },
    { key: "exterior-building", src: nhExterior3, alt: "New Heights Building", category: "Exterior" },
    { key: "single-room", src: nhSingleRoom, alt: "Single Room", category: "Rooms" },
    { key: "couple-room", src: nhCoupleRoom, alt: "Couple Suite", category: "Rooms" },
    { key: "sharing-room", src: nhSharingRoom, alt: "Sharing Room", category: "Rooms" },
    { key: "restaurant", src: nhDining1, alt: "Restaurant Ambiance", category: "Dining" },
    { key: "dining-area", src: nhDining2, alt: "Dining Area", category: "Dining" },
  ],
};

export function getPropertyGalleryImages(guestHouse: GuestHouse): PropertyGalleryImage[] {
  return propertyGallery[guestHouse];
}
