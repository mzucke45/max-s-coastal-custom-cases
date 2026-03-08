export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  collection: string;
}

export interface PhoneModel {
  id: string;
  name: string;
  brand: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const phoneModels: PhoneModel[] = [
  // iPhone models (post-iPhone X)
  { id: "iphone-xr", name: "iPhone XR", brand: "Apple" },
  { id: "iphone-xs", name: "iPhone XS", brand: "Apple" },
  { id: "iphone-xs-max", name: "iPhone XS Max", brand: "Apple" },
  { id: "iphone-11", name: "iPhone 11", brand: "Apple" },
  { id: "iphone-11-pro", name: "iPhone 11 Pro", brand: "Apple" },
  { id: "iphone-11-pro-max", name: "iPhone 11 Pro Max", brand: "Apple" },
  { id: "iphone-12", name: "iPhone 12", brand: "Apple" },
  { id: "iphone-12-mini", name: "iPhone 12 Mini", brand: "Apple" },
  { id: "iphone-12-pro", name: "iPhone 12 Pro", brand: "Apple" },
  { id: "iphone-12-pro-max", name: "iPhone 12 Pro Max", brand: "Apple" },
  { id: "iphone-13", name: "iPhone 13", brand: "Apple" },
  { id: "iphone-13-mini", name: "iPhone 13 Mini", brand: "Apple" },
  { id: "iphone-13-pro", name: "iPhone 13 Pro", brand: "Apple" },
  { id: "iphone-13-pro-max", name: "iPhone 13 Pro Max", brand: "Apple" },
  { id: "iphone-14", name: "iPhone 14", brand: "Apple" },
  { id: "iphone-14-plus", name: "iPhone 14 Plus", brand: "Apple" },
  { id: "iphone-14-pro", name: "iPhone 14 Pro", brand: "Apple" },
  { id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", brand: "Apple" },
  { id: "iphone-15", name: "iPhone 15", brand: "Apple" },
  { id: "iphone-15-plus", name: "iPhone 15 Plus", brand: "Apple" },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", brand: "Apple" },
  { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", brand: "Apple" },
  { id: "iphone-16", name: "iPhone 16", brand: "Apple" },
  { id: "iphone-16-plus", name: "iPhone 16 Plus", brand: "Apple" },
  { id: "iphone-16-pro", name: "iPhone 16 Pro", brand: "Apple" },
  { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", brand: "Apple" },
  // Samsung
  { id: "samsung-s24-ultra", name: "Galaxy S24 Ultra", brand: "Samsung" },
  { id: "samsung-s24", name: "Galaxy S24", brand: "Samsung" },
  { id: "samsung-s23", name: "Galaxy S23", brand: "Samsung" },
];

export const collections: Collection[] = [
  {
    id: "coastal-series",
    name: "Coastal Series",
    description: "Inspired by the Pacific shoreline — textured blues, gentle gradients, and the quiet beauty of the coast.",
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=600&fit=crop",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    description: "Warm amber tones and soft light captured at the edge of day. For those who live for the sunset.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Refined simplicity. Clean lines, muted palettes, and understated elegance for the modern aesthetic.",
    image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&h=600&fit=crop",
  },
];

export const products: Product[] = [
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    description: "A mesmerizing blue gradient inspired by the Pacific coastline. Each case captures the depth and movement of open water.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=600&fit=crop",
    category: "Nature",
    collection: "coastal-series",
  },
  {
    id: "sunset-shore",
    name: "Sunset Shore",
    description: "Golden hour captured in a warm, dreamy design that evokes the last light of a perfect beach day.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop",
    category: "Nature",
    collection: "golden-hour",
  },
  {
    id: "tropical-palms",
    name: "Tropical Palms",
    description: "Swaying palms and island light. A design that brings warmth and escapism to the everyday.",
    price: 32.99,
    image: "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=400&h=600&fit=crop",
    category: "Tropical",
    collection: "golden-hour",
  },
  {
    id: "coral-reef",
    name: "Coral Reef",
    description: "Vibrant underwater hues inspired by living coral formations. A celebration of ocean biodiversity.",
    price: 32.99,
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&h=600&fit=crop",
    category: "Nature",
    collection: "coastal-series",
  },
  {
    id: "sandy-minimalist",
    name: "Sandy Minimalist",
    description: "Clean, earthy tones with a refined sandy finish. Designed for those who appreciate quiet sophistication.",
    price: 27.99,
    image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400&h=600&fit=crop",
    category: "Minimal",
    collection: "minimalist",
  },
  {
    id: "deep-blue",
    name: "Deep Blue",
    description: "Rich navy tones that echo the open ocean. A timeless design for the depth-seeker.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop",
    category: "Nature",
    collection: "coastal-series",
  },
];
