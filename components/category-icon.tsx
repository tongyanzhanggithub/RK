import {
  Boxes,
  Cog,
  Disc3,
  Droplets,
  Fuel,
  Hammer,
  PackageOpen,
  Power,
  Tag,
  Wrench,
  Zap,
  type LucideIcon
} from "lucide-react";

// Curated icon per top-level category slug. New/unknown categories fall back to a
// generic tag icon (or set Category.icon in the admin to override by lucide name).
const BY_SLUG: Record<string, LucideIcon> = {
  "complete-engines": Cog,
  "engine-parts": Wrench,
  "fuel-system": Fuel,
  "ignition-electrical": Zap,
  "drivetrain-clutch": Disc3,
  "cooling-water-pump": Droplets,
  "starter-system": Power,
  "repair-kits": PackageOpen,
  "tools-consumables": Hammer,
  "universal-parts": Boxes
};

const BY_NAME: Record<string, LucideIcon> = {
  Cog,
  Wrench,
  Fuel,
  Zap,
  Disc3,
  Droplets,
  Power,
  PackageOpen,
  Hammer,
  Boxes,
  Tag
};

export function CategoryIcon({
  slug,
  icon,
  size = 18,
  className = ""
}: {
  slug: string;
  icon?: string | null;
  size?: number;
  className?: string;
}) {
  const Icon = (icon && BY_NAME[icon]) || BY_SLUG[slug] || Tag;
  return <Icon size={size} className={className} />;
}
