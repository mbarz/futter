import { Meal } from "./meal";

export type Day = {
  date: string;
  name: string;
  meals: Meal[];
};
