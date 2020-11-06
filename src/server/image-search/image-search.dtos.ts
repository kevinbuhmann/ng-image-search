export type ImageSort =
  | 'date-posted-asc'
  | 'date-posted-desc'
  | 'date-taken-asc'
  | 'date-taken-desc'
  | 'interestingness-asc'
  | 'interestingness-desc'
  | 'relevance';

export interface Image {
  title: string;
  url: string;
  thumbnailUrl: string;
  licenseId: number;
}

export interface ImageSearchResults {
  searchTerm: string;
  page: number;
  total: number;
  images: Image[];
}
