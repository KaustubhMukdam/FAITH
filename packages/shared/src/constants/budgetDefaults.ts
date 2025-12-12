export const BudgetDefaults = {
  ALERT_THRESHOLDS: {
    ESSENTIAL: 90, // Alert at 90%
    FLEXIBLE: 85,
    DISCRETIONARY: 80,
  },
  ROLLOVER_PERCENTAGES: {
    ESSENTIAL: 0, // No rollover
    FLEXIBLE: 50, // 50% rollover
    DISCRETIONARY: 30,
  },
  RECOMMENDED_ALLOCATION: {
    ESSENTIAL: 60, // 60% of total budget
    FLEXIBLE: 30,
    DISCRETIONARY: 10,
  },
} as const;
