import { Event } from "@/lib/data/events";

export interface ReservationPackage {
  id: string;
  title: string;
  description: string;
  capacity: number;
  baseSpend: number;
  defaultDepositRate: number;
}

export interface EventPackagePricing extends ReservationPackage {
  minimumSpendPerTable: number;
  depositRate: number;
  depositPerTable: number;
}

interface PricingModifier {
  id: string;
  multiplier: number;
  depositRateOverride?: number;
  applies(event: Event): boolean;
}

const reservationPackages: ReservationPackage[] = [
  {
    id: "vip-lounge",
    title: "VIP lounge",
    description:
      "Wrap-around seating with private attendants and chilled champagne towers ready as soon as you arrive.",
    capacity: 6,
    baseSpend: 520,
    defaultDepositRate: 0.45,
  },
  {
    id: "stage-deck",
    title: "Stage deck",
    description:
      "Closest to the DJs with illuminated cocktail trees, bottle presenters and space for elevated dancing.",
    capacity: 8,
    baseSpend: 680,
    defaultDepositRate: 0.5,
  },
  {
    id: "sky-booth",
    title: "Sky booth",
    description:
      "Overlooks the dance floor with plush banquettes, premium sprits cabinet and private photo concierge.",
    capacity: 10,
    baseSpend: 840,
    defaultDepositRate: 0.55,
  },
];

const pricingModifiers: PricingModifier[] = [
  {
    id: "weekend-night-premium",
    multiplier: 1.25,
    depositRateOverride: 0.6,
    applies(event) {
      const date = new Date(event.start);
      const day = date.getDay();
      const isWeekend = day === 5 || day === 6; // Friday/Saturday
      return event.category === "night" && isWeekend;
    },
  },
  {
    id: "launch-event-premium",
    multiplier: 1.35,
    depositRateOverride: 0.65,
    applies(event) {
      return event.category === "launch";
    },
  },
  {
    id: "day-party-relief",
    multiplier: 0.92,
    depositRateOverride: 0.4,
    applies(event) {
      return event.category === "day";
    },
  },
  {
    id: "community-night-discount",
    multiplier: 0.85,
    depositRateOverride: 0.3,
    applies(event) {
      return event.category === "community";
    },
  },
  {
    id: "low-inventory-surge",
    multiplier: 1.1,
    applies(event) {
      if (event.totalTables === 0) {
        return false;
      }

      return event.remainingTables / event.totalTables <= 0.25;
    },
  },
];

function getMultiplierForEvent(event: Event): number {
  return pricingModifiers
    .filter((modifier) => modifier.applies(event))
    .reduce((accumulator, modifier) => accumulator * modifier.multiplier, 1);
}

function getDepositRateForEvent(baseRate: number, event: Event): number {
  let rate = baseRate;

  for (const modifier of pricingModifiers) {
    if (modifier.applies(event) && typeof modifier.depositRateOverride === "number") {
      rate = modifier.depositRateOverride;
    }
  }

  return rate;
}

export function getReservationPackages(): ReservationPackage[] {
  return reservationPackages;
}

export function getEventPackages(event: Event): EventPackagePricing[] {
  const multiplier = getMultiplierForEvent(event);

  return reservationPackages.map((pkg) => {
    const minimumSpendPerTable = Number((pkg.baseSpend * multiplier).toFixed(2));
    const depositRate = getDepositRateForEvent(pkg.defaultDepositRate, event);
    const depositPerTable = Number((minimumSpendPerTable * depositRate).toFixed(2));

    return {
      ...pkg,
      minimumSpendPerTable,
      depositRate,
      depositPerTable,
    };
  });
}

export function findEventPackage(event: Event, packageId: string): EventPackagePricing | undefined {
  return getEventPackages(event).find((pkg) => pkg.id === packageId);
}

export function getDefaultPackageId(event: Event): string {
  const packages = getEventPackages(event);
  return packages[0]?.id ?? reservationPackages[0].id;
}
