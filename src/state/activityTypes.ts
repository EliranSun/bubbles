export type ActivityCategory = string;

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  createdAt: number;
  lastResetAt: number;
  imageUrl: string | null;
  x: number;
  y: number;
}
