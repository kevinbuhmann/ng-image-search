export interface Photo {
  title: string;
  url: string;
  thumbnailUrl: string;
}

export interface ImageSearchResults {
  searchTerm: string;
  page: number;
  total: number;
  photos: Photo[];
}
