export const CATEGORIES = [
  "Food", "Housing", "Transport", "Utilities", "Healthcare",
  "Entertainment", "Shopping", "Education", "Personal Care",
  "Travel", "Subscriptions", "Donations", "Other",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Food:          "#e0896e",
  Housing:       "#7bab91",
  Transport:     "#7aaed0",
  Utilities:     "#d9b86a",
  Healthcare:    "#d98293",
  Entertainment: "#a87abf",
  Shopping:      "#cf8e98",
  Education:     "#5da99d",
  "Personal Care": "#ae97c6",
  Travel:        "#65aed1",
  Subscriptions: "#919daa",
  Donations:     "#8bac70",
  Other:         "#9a9ea6",
};
