export type Equipment = {
  slug: string;
  name: string;
  description: string;
  commonModels: string[];
  commonProblems: string[];
};

export const equipment: Equipment[] = [
  { slug: "portable-generator", name: "Portable Generator", description: "Gasoline generators from 3kW to 5kW used by homes, shops and rental fleets.", commonModels: ["168F", "170F", "188F", "3kW Generator", "5kW Generator"], commonProblems: ["Engine won't start", "Generator no voltage", "Hard starting"] },
  { slug: "gasoline-water-pump", name: "Gasoline Water Pump", description: "2 inch and 3 inch water pumps for irrigation, drainage and construction work.", commonModels: ["168F", "170F", "2 Inch Water Pump", "3 Inch Water Pump"], commonProblems: ["Water pump leaking", "Water pump not suction", "Hard starting"] },
  { slug: "small-gasoline-engine", name: "Small Gasoline Engine", description: "General purpose gasoline engines used across small equipment platforms.", commonModels: ["168F", "170F", "188F", "190F", "GX160", "GX200"], commonProblems: ["Engine won't start", "Engine runs rough", "Poor fuel flow"] },
  { slug: "tiller", name: "Tiller", description: "Small agricultural tillers using 168F, 170F and similar gasoline engines.", commonModels: ["168F", "170F", "GX160"], commonProblems: ["Pull starter broken", "Hard starting", "Poor maintenance"] },
  { slug: "sprayer", name: "Sprayer", description: "Agricultural sprayers and portable machines that need seasonal service kits.", commonModels: ["168F", "GX160"], commonProblems: ["Hard starting", "Dirty air filter", "Poor fuel flow"] },
  { slug: "lawn-garden-machine", name: "Lawn & Garden Machine", description: "Garden machines and outdoor power equipment using small gasoline engines.", commonModels: ["168F", "170F", "GX160", "GX200"], commonProblems: ["Hard starting", "Engine runs rough"] },
  { slug: "light-construction-machine", name: "Light Construction Machine", description: "Light site equipment requiring field repair kits and maintenance packs.", commonModels: ["170F", "188F", "GX200"], commonProblems: ["Pull starter broken", "Poor maintenance"] }
];

export function getEquipment(slug: string) {
  return equipment.find((item) => item.slug === slug);
}
