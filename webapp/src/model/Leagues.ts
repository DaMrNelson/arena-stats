export const SORTED_TIERS = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"] as const;
export type RankedTier = typeof SORTED_TIERS[number];
export const SORTED_HUMAN_TIERS = [
  "Iron",
  "Bronze", "Silver", "Gold",
  "Platinum", "Emerald", "Diamond",
  "Master", "Grandmaster", "Challenger",
];

//export const SORTED_DIVISIONS = ["I", "II", "III", "IV"] as const;
export const SORTED_DIVISIONS = ["IV", "III", "II", "I"] as const;
export type RankedDivision = typeof SORTED_DIVISIONS[number];
