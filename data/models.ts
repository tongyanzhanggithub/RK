export type EngineModel = {
  slug: string;
  name: string;
  description: string;
  commonEquipment: string[];
  commonProblems: string[];
  compatibilityNote: string;
};

export const models: EngineModel[] = [
  { slug: "168f", name: "168F", description: "Common small gasoline engine platform used in generators, pumps, tillers and sprayers.", commonEquipment: ["Portable generator", "Gasoline water pump", "Tiller", "Sprayer"], commonProblems: ["Engine won't start", "Hard starting", "Pull starter broken"], compatibilityNote: "Confirm air filter shape, recoil starter mounting and carburetor linkage before ordering." },
  { slug: "170f", name: "170F", description: "Slightly larger gasoline engine platform used in pumps and agricultural equipment.", commonEquipment: ["Gasoline water pump", "Tiller", "Light construction machine"], commonProblems: ["Engine runs rough", "Pull starter broken"], compatibilityNote: "Some parts overlap with 168F, but carburetor and gasket details may differ." },
  { slug: "188f", name: "188F", description: "Larger engine platform often used with higher capacity generators and pumps.", commonEquipment: ["5kW generator", "Larger water pump"], commonProblems: ["Hard starting", "Poor maintenance"], compatibilityNote: "Do not assume 168F/170F parts fit 188F engines." },
  { slug: "190f", name: "190F", description: "High output small engine platform for heavier generator and pump applications.", commonEquipment: ["5kW generator", "Light construction machine"], commonProblems: ["Hard starting", "Poor fuel flow"], compatibilityNote: "Ask before buying if the carburetor or recoil housing shape is uncertain." },
  { slug: "gx160", name: "GX160", description: "GX160 style engines share many service parts with 168F style engines.", commonEquipment: ["Portable generator", "Water pump", "Tiller"], commonProblems: ["Engine won't start", "Dirty air filter"], compatibilityNote: "GX160 style does not guarantee exact Honda original compatibility." },
  { slug: "gx200", name: "GX200", description: "GX200 style engines are common in pumps, tillers and light equipment.", commonEquipment: ["Water pump", "Tiller", "Light construction machine"], commonProblems: ["Pull starter broken", "Engine runs rough"], compatibilityNote: "Confirm carburetor mounting and air filter size before ordering." },
  { slug: "2-inch-water-pump", name: "2 Inch Water Pump", description: "Common gasoline pump size for irrigation and drainage.", commonEquipment: ["Gasoline water pump"], commonProblems: ["Water pump leaking", "Water pump not suction"], compatibilityNote: "Pump seal dimensions and connector shape must be checked." },
  { slug: "3-inch-water-pump", name: "3 Inch Water Pump", description: "Larger pump body used in agriculture and construction drainage.", commonEquipment: ["Gasoline water pump"], commonProblems: ["Water pump leaking", "Weak suction"], compatibilityNote: "Confirm pump body series and seal size before ordering." },
  { slug: "3kw-generator", name: "3kW Generator", description: "Portable generator class commonly powered by 168F or 170F style engines.", commonEquipment: ["Portable generator"], commonProblems: ["Engine won't start", "Generator no voltage"], compatibilityNote: "Electrical parts require wiring and plug confirmation." },
  { slug: "5kw-generator", name: "5kW Generator", description: "Larger portable generator class commonly paired with 188F style engines.", commonEquipment: ["Portable generator"], commonProblems: ["Hard starting", "Poor maintenance"], compatibilityNote: "Engine service kits and electrical kits must be selected separately." }
];

export function getModel(slug: string) {
  return models.find((model) => model.slug === slug);
}
