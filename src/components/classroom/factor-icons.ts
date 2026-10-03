import type { FactorId } from "./content";
import { CanIcon, ShovelIcon, SunIcon, WindIcon } from "./icons";

/** One icon per growth factor, shared by the home cards and the grow game. */
export const FACTOR_ICONS = {
  sun: SunIcon,
  water: CanIcon,
  soil: ShovelIcon,
  air: WindIcon,
} as const satisfies Record<FactorId, unknown>;
