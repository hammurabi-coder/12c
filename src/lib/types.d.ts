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
  /** Section footnotes — present in JSON data but not yet rendered in the UI */
  notes: Record<string, string>;
}
