export type SortOption = "created" | "updated" | "stars" | "activity";

export interface Filters {
  languages: string[];
  sortBy: SortOption;
}