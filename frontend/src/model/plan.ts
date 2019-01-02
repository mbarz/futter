import { Day } from "./day";

export type Plan = {
  [key: string]: {
    plans: {
      [lang: string]: Day[];
    };
  };
};
