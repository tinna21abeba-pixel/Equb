/**
 * Centralized Ethiopian Equb Plans Configuration
 * Defines the standard 6 plans and customizable options.
 * Stored centrally so administrators and organizers can configure values.
 */

export const EQUB_PLANS = [
  {
    id: "daily-300",
    name: "Daily Equb — 300 ETB",
    tier: "Daily Essential",
    contributionAmount: 300,
    frequency: "daily",
    maxMembers: 50,
    lotteryFrequency: "Daily",
    targetPool: 15000, // 300 ETB * 50 members
    winnersPerDraw: 1,
    isMembershipConfigurable: false,
    isContributionConfigurable: false,
    description: "Daily contribution of 300 ETB per member with a 50-member capacity and daily lottery draws.",
  },
  {
    id: "daily-500",
    name: "Daily Equb — 500 ETB",
    tier: "Daily Growth",
    contributionAmount: 500,
    frequency: "daily",
    maxMembers: 40,
    lotteryFrequency: "Daily",
    targetPool: 20000, // 500 ETB * 40 members
    winnersPerDraw: 1,
    isMembershipConfigurable: false,
    isContributionConfigurable: false,
    description: "Daily contribution of 500 ETB per member with a 40-member capacity and daily lottery draws.",
  },
  {
    id: "weekly-1000",
    name: "Weekly Equb — 1,000 ETB",
    tier: "Weekly Standard",
    contributionAmount: 1000,
    frequency: "weekly",
    maxMembers: 30,
    lotteryFrequency: "Weekly",
    targetPool: 30000, // 1000 ETB * 30 members
    winnersPerDraw: 1,
    isMembershipConfigurable: false,
    isContributionConfigurable: false,
    description: "Weekly contribution of 1,000 ETB per member with a 30-member capacity and weekly lottery draws.",
  },
  {
    id: "biweekly-2000",
    name: "Biweekly Draw Equb — 2,000 ETB",
    tier: "Biweekly Flex",
    contributionAmount: 2000, // Contributed weekly (2,000 ETB/wk = 4,000 ETB per 2-week cycle)
    effectiveRoundAmount: 4000,
    frequency: "biweekly",
    maxMembers: 25, // Configurable default
    lotteryFrequency: "Once every two weeks",
    targetPool: 100000, // 4,000 * 25
    winnersPerDraw: 1,
    isMembershipConfigurable: true,
    isContributionConfigurable: false,
    description: "2,000 ETB contributed weekly (4,000 ETB per 2-week cycle) with draws held once every two weeks.",
  },
  {
    id: "monthly-standard",
    name: "Monthly Equb — Standard",
    tier: "Monthly Community",
    contributionAmount: 2000, // Default suggested
    frequency: "monthly",
    maxMembers: 25, // Configurable default
    lotteryFrequency: "Monthly",
    targetPool: 50000, // 2,000 * 25
    winnersPerDraw: 1,
    isMembershipConfigurable: true,
    isContributionConfigurable: true,
    description: "Standard monthly savings group with 2,000 ETB default contribution and configurable capacity.",
  },
  {
    id: "monthly-premium",
    name: "Monthly Equb — Premium",
    tier: "Monthly Executive",
    contributionAmount: 5000, // Default suggested
    frequency: "monthly",
    maxMembers: 20, // Configurable default
    lotteryFrequency: "Monthly",
    targetPool: 100000, // 5,000 * 20
    winnersPerDraw: 1,
    isMembershipConfigurable: true,
    isContributionConfigurable: true,
    description: "Premium monthly savings group with 5,000 ETB default contribution and configurable capacity.",
  },
];

export const CUSTOM_PLAN_ID = "custom";

/**
 * Retrieve plan definition by id
 */
export function getPlanById(planId) {
  if (!planId || planId === CUSTOM_PLAN_ID) return null;
  return EQUB_PLANS.find((p) => p.id === planId) ?? null;
}

/**
 * Calculate expected pot / target pool based on plan or custom parameters
 */
export function getExpectedTargetPool(planId, contributionAmount, memberCount) {
  const plan = getPlanById(planId);
  if (plan) {
    const effectiveAmount = plan.effectiveRoundAmount || plan.contributionAmount;
    return effectiveAmount * (memberCount || plan.maxMembers);
  }
  return Number(contributionAmount || 0) * Number(memberCount || 0);
}

/**
 * Get human-readable frequency label
 */
export const PLAN_FREQUENCY_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly (Every 2 weeks)",
  monthly: "Monthly",
};
