export type PhotoItem = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  tags: string[];
  favorite: boolean;
};

export const mockPhotos: PhotoItem[] = [
  {
    id: "photo-1",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    alt: "Berlin city view at golden hour",
    width: 900,
    height: 1200,
    tags: ["City", "Travel"],
    favorite: true,
  },
  {
    id: "photo-2",
    src: "https://images.unsplash.com/photo-1491553895911-0055e6a9e48a?auto=format&fit=crop&w=900&q=80",
    alt: "Minimal lakeside cabin with mountain reflections",
    width: 900,
    height: 1200,
    tags: ["Nature", "Travel"],
    favorite: false,
  },
  {
    id: "photo-3",
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    alt: "Sunset beach landscape with warm tones",
    width: 900,
    height: 1200,
    tags: ["Nature", "Travel"],
    favorite: true,
  },
  {
    id: "photo-4",
    src: "https://images.unsplash.com/photo-1483794344563-d27a8d659da0?auto=format&fit=crop&w=900&q=80",
    alt: "Berlin cathedral by the river at dusk",
    width: 900,
    height: 1400,
    tags: ["City", "Culture"],
    favorite: false,
  },
  {
    id: "photo-5",
    src: "https://images.unsplash.com/photo-1465156799760-4f7c4fc7d3a7?auto=format&fit=crop&w=900&q=80",
    alt: "Architectural street view with soft shadows",
    width: 900,
    height: 1100,
    tags: ["City", "People"],
    favorite: false,
  },
  {
    id: "photo-6",
    src: "https://images.unsplash.com/photo-1554784941-7c6a482bfe71?auto=format&fit=crop&w=900&q=80",
    alt: "Wildflower field with golden sunlight",
    width: 900,
    height: 1000,
    tags: ["Nature", "Food"],
    favorite: true,
  },
  {
    id: "photo-7",
    src: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=900&q=80",
    alt: "Coastal cliffside picnic with ocean view",
    width: 900,
    height: 1200,
    tags: ["Travel", "Nature"],
    favorite: false,
  },
  {
    id: "photo-8",
    src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
    alt: "Architectural balconies on a city street",
    width: 900,
    height: 1200,
    tags: ["City", "Architecture"],
    favorite: false,
  },
  {
    id: "photo-9",
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    alt: "Foggy forest valley in the morning",
    width: 900,
    height: 1200,
    tags: ["Nature", "Travel"],
    favorite: true,
  },
  {
    id: "photo-10",
    src: "https://images.unsplash.com/photo-1439396087961-98bc12c21176?auto=format&fit=crop&w=900&q=80",
    alt: "Sunlit mountain meadow with pine trees",
    width: 900,
    height: 1200,
    tags: ["Nature", "Travel"],
    favorite: false,
  },
  {
    id: "photo-11",
    src: "https://images.unsplash.com/photo-1529068755536-a5ade49428fc?auto=format&fit=crop&w=900&q=80",
    alt: "Picnic set on cliff edge above the sea",
    width: 900,
    height: 1100,
    tags: ["Travel", "Food"],
    favorite: false,
  },
  {
    id: "photo-12",
    src: "https://images.unsplash.com/photo-1491553895911-0055e6a9e48a?auto=format&fit=crop&w=900&q=80",
    alt: "Lake view with mountains and deep blue water",
    width: 900,
    height: 1200,
    tags: ["Nature", "Travel"],
    favorite: true,
  },
];
