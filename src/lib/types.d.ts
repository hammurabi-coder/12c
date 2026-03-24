export interface Caesar {
  name: string;
  latin: string;
  dates: string;
  reign: string;
  tag: string;
  n: string;
  slug: string;
}

export interface Section {
  heading: string;
  en: string;
  la: string;
}

export interface Biography {
  name: string;
  sections: Section[];
  notes: Record<string, string>;
}
