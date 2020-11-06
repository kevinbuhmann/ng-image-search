export interface Image {
  title: string;
  url: string;
  thumbnailUrl: string;
}

export interface ImageSearchResults {
  searchTerm: string;
  page: number;
  total: number;
  images: Image[];
}
