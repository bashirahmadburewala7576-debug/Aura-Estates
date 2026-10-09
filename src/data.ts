export type PropertyStatus = "Available" | "Sold" | "Rented";
export type PropertyType = "House" | "Apartment" | "Villa" | "Townhouse" | "Penthouse";
export type Furnishing = "Furnished" | "Semi-furnished" | "Unfurnished";
export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  listing: "Buy" | "Rent";
  location: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  status: PropertyStatus;
  description: string;
  images: string[];
  amenities: string[];
  furnishing: Furnishing;
  yearBuilt: number;
  featured: boolean;
  createdAt: string;
  agent: { name: string; role: string; phone: string; email: string };
}

const image = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
// Unsplash photo IDs are stored as data; fallback images remain remote URLs.
const photoIds = [
  "photo-1600594745781-285ebf2f9b5b",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600585154340-be6161a56a0c",
  "photo-1600566753086-00f18fb6b3ea",
  "photo-1600047509807-ba8f99d2cdde",
  "photo-1600607687920-4e2a09cf159d",
  "photo-1600566753190-17f0baa2a6c3",
  "photo-1600607687644-c7171b42498f",
  "photo-1600585154526-990dced4db0d",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600566753086-00f18fb6b3ea",
  "photo-1600607687920-4e2a09cf159d"
];
// Replace any placeholder typo with a valid Unsplash image ID.
const safePhotoIds = photoIds;
const locations = ["DHA Phase 6, Lahore", "Gulberg III, Lahore", "Bahria Town, Lahore", "Model Town, Lahore", "DHA Phase 5, Lahore", "Askari 10, Lahore", "Johar Town, Lahore", "Canal Road, Lahore", "E-11, Islamabad", "F-7, Islamabad"];
const titles = ["The Willow Residence", "The Glasshouse", "Serene Courtyard Home", "The Linden Villa", "Parkview Penthouse", "The Heritage House", "Skyline Apartment", "The Garden Residence", "The Modernist", "Olive Grove Villa", "The Cornerstone", "The Solstice Home", "The Courtyard", "The Vista Residence", "The Cedar House", "The Atrium Apartment", "The Horizon Villa", "The Magnolia", "The Orchard House", "The Terrace Residence", "The Signature Suite", "The Maple Residence", "The Grand Pavilion", "The Sanctuary", "The Crescent House", "The Pearl Apartment", "The Summit Villa", "The Fern Residence", "The Residence 27", "The Amber House"];
const descriptions = [
  "Thoughtfully designed living spaces with generous natural light, considered finishes, and a layout made for everyday living. Close to schools, cafés, green spaces, and essential services.",
  "A beautifully balanced home with refined materials, open-plan entertaining areas, and peaceful private spaces. Designed to bring comfort, function, and understated elegance together.",
  "An inviting residence offering a practical floor plan, a calm atmosphere, and quality details throughout. Enjoy an easy connection between indoor living and outdoor relaxation."
];
const amenitiesList = [
  ["Swimming pool", "Gym", "24/7 security", "Backup power", "Balcony"],
  ["Garden", "Parking", "CCTV", "Fitted kitchen", "Nearby parks"],
  ["Elevator", "Concierge", "Central heating", "Smart home", "Terrace"],
  ["Clubhouse", "Play area", "Water filtration", "Storage", "Walk-in closet"]
];
export const initialProperties: Property[] = Array.from({ length: 30 }, (_, i) => {
  const type = (["House", "Apartment", "Villa", "Townhouse", "Penthouse"] as PropertyType[])[i % 5];
  const listing: "Buy" | "Rent" = i % 4 === 1 ? "Rent" : "Buy";
  const p = safePhotoIds[i % safePhotoIds.length];
  const p2 = safePhotoIds[(i + 3) % safePhotoIds.length];
  const p3 = safePhotoIds[(i + 6) % safePhotoIds.length];
  return {
    id: `HV-${String(1024 + i)}`,
    title: titles[i],
    type,
    listing,
    location: locations[i % locations.length],
    price: listing === "Rent" ? 90000 + (i % 6) * 25000 : 14500000 + (i % 10) * 4850000,
    area: [5, 7, 10, 12, 14, 18][i % 6] * 225,
    bedrooms: 2 + (i % 5),
    bathrooms: 2 + (i % 4),
    parking: 1 + (i % 3),
    status: i === 7 ? "Sold" : i === 13 ? "Rented" : "Available",
    description: descriptions[i % descriptions.length],
    images: [image(p), image(p2), image(p3)],
    amenities: amenitiesList[i % amenitiesList.length],
    furnishing: (["Furnished", "Semi-furnished", "Unfurnished"] as Furnishing[])[i % 3],
    yearBuilt: 2016 + (i % 9),
    featured: i < 6 || i % 7 === 0,
    createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    agent: { name: ["Ayesha Khan", "Hamza Ali", "Sara Malik"][i % 3], role: "Property Consultant", phone: "+92 300 1234567", email: "hello@auraestates.example" }
  };
});