export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  tags: string[];
  favorite: boolean;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: string;
  createdAt: string;
  uploadedByUserId: string | null;
};

export type GalleryData = {
  photos: GalleryPhoto[];
  tags: string[];
  hasMore: boolean;
  limit: number;
};
