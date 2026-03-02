export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface PhoneModel {
  id: string;
  name: string;
  brand: string;
}

export const phoneModels: PhoneModel[] = [
  { id: "iphone-15-pro", name: "iPhone 15 Pro", brand: "Apple" },
  { id: "iphone-15", name: "iPhone 15", brand: "Apple" },
  { id: "iphone-14", name: "iPhone 14", brand: "Apple" },
  { id: "samsung-s24", name: "Galaxy S24", brand: "Samsung" },
  { id: "samsung-s23", name: "Galaxy S23", brand: "Samsung" },
  { id: "pixel-8", name: "Pixel 8", brand: "Google" },
  { id: "pixel-7", name: "Pixel 7", brand: "Google" },
];

export const products: Product[] = [
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    description: "Ride the wave with this mesmerizing blue gradient case inspired by the Pacific coastline.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=600&fit=crop",
    category: "Nature",
  },
  {
    id: "sunset-shore",
    name: "Sunset Shore",
    description: "Golden hour vibes captured in a warm, dreamy design that glows like a beach sunset.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop",
    category: "Nature",
  },
  {
    id: "tropical-palms",
    name: "Tropical Palms",
    description: "Swaying palms and island breeze — carry paradise in your pocket.",
    price: 32.99,
    image: "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=400&h=600&fit=crop",
    category: "Tropical",
  },
  {
    id: "coral-reef",
    name: "Coral Reef",
    description: "Vibrant underwater colors inspired by living coral reefs.",
    price: 32.99,
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&h=600&fit=crop",
    category: "Nature",
  },
  {
    id: "sandy-minimalist",
    name: "Sandy Minimalist",
    description: "Clean, earthy tones with a textured sandy finish for the minimalist soul.",
    price: 27.99,
    image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400&h=600&fit=crop",
    category: "Minimal",
  },
  {
    id: "deep-blue",
    name: "Deep Blue",
    description: "Dive deep into rich navy tones that echo the open ocean.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop",
    category: "Nature",
  },
];
