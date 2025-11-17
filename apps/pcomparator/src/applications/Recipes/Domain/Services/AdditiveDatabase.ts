/**
 * Base de données des additifs alimentaires avec niveaux de risque
 * Basé sur la classification Yuka : SAFE, MODERATE, HIGH_RISK, DANGEROUS
 */

export type AdditiveRiskLevel = "safe" | "moderate" | "high_risk" | "dangerous";

export interface Additive {
  code: string; // e.g., "E414"
  name: string; // e.g., "Gomme arabique"
  riskLevel: AdditiveRiskLevel;
  description?: string;
}

/**
 * Base de données des additifs les plus courants
 * Source : Yuka, Open Food Facts
 */
export const ADDITIVES_DATABASE: Record<string, Additive> = {
  // SAFE (Vert)
  E100: { code: "E100", name: "Curcumine", riskLevel: "safe", description: "Colorant jaune naturel" },
  E140: { code: "E140", name: "Chlorophylle", riskLevel: "safe", description: "Colorant vert naturel" },
  E160a: { code: "E160a", name: "Bêta-carotène", riskLevel: "safe", description: "Colorant orange naturel" },
  E300: {
    code: "E300",
    name: "Acide ascorbique (Vitamine C)",
    riskLevel: "safe",
    description: "Antioxydant"
  },
  E306: { code: "E306", name: "Vitamine E", riskLevel: "safe", description: "Antioxydant naturel" },
  E330: { code: "E330", name: "Acide citrique", riskLevel: "safe", description: "Acidifiant naturel" },
  E322: { code: "E322", name: "Lécithine", riskLevel: "safe", description: "Émulsifiant naturel" },
  E414: { code: "E414", name: "Gomme arabique", riskLevel: "safe", description: "Épaississant naturel" },
  E440: { code: "E440", name: "Pectine", riskLevel: "safe", description: "Gélifiant naturel" },
  E500: { code: "E500", name: "Carbonate de sodium", riskLevel: "safe", description: "Régulateur d'acidité" },
  E501: {
    code: "E501",
    name: "Carbonate de potassium",
    riskLevel: "safe",
    description: "Régulateur d'acidité"
  },

  // MODERATE (Jaune)
  E150: { code: "E150", name: "Caramel", riskLevel: "moderate", description: "Colorant" },
  E202: { code: "E202", name: "Sorbate de potassium", riskLevel: "moderate", description: "Conservateur" },
  E211: { code: "E211", name: "Benzoate de sodium", riskLevel: "moderate", description: "Conservateur" },
  E220: {
    code: "E220",
    name: "Dioxyde de soufre",
    riskLevel: "moderate",
    description: "Conservateur et antioxydant"
  },
  E301: { code: "E301", name: "Ascorbate de sodium", riskLevel: "moderate", description: "Antioxydant" },
  E407: { code: "E407", name: "Carraghénane", riskLevel: "moderate", description: "Épaississant" },
  E412: { code: "E412", name: "Gomme guar", riskLevel: "moderate", description: "Épaississant" },
  E415: { code: "E415", name: "Gomme xanthane", riskLevel: "moderate", description: "Épaississant" },
  E450: { code: "E450", name: "Diphosphates", riskLevel: "moderate", description: "Émulsifiant" },
  E471: {
    code: "E471",
    name: "Mono et diglycérides d'acides gras",
    riskLevel: "moderate",
    description: "Émulsifiant"
  },

  // HIGH_RISK (Orange)
  E102: {
    code: "E102",
    name: "Tartrazine",
    riskLevel: "high_risk",
    description: "Colorant jaune synthétique"
  },
  E104: {
    code: "E104",
    name: "Jaune de quinoléine",
    riskLevel: "high_risk",
    description: "Colorant synthétique"
  },
  E110: { code: "E110", name: "Jaune orangé S", riskLevel: "high_risk", description: "Colorant synthétique" },
  E122: {
    code: "E122",
    name: "Azorubine",
    riskLevel: "high_risk",
    description: "Colorant rouge synthétique"
  },
  E124: {
    code: "E124",
    name: "Ponceau 4R",
    riskLevel: "high_risk",
    description: "Colorant rouge synthétique"
  },
  E129: {
    code: "E129",
    name: "Rouge allura AC",
    riskLevel: "high_risk",
    description: "Colorant rouge synthétique"
  },
  E150c: { code: "E150c", name: "Caramel ammoniacal", riskLevel: "high_risk", description: "Colorant" },
  E150d: {
    code: "E150d",
    name: "Caramel au sulfite d'ammonium",
    riskLevel: "high_risk",
    description: "Colorant"
  },
  E249: { code: "E249", name: "Nitrite de potassium", riskLevel: "high_risk", description: "Conservateur" },
  E250: { code: "E250", name: "Nitrite de sodium", riskLevel: "high_risk", description: "Conservateur" },
  E320: { code: "E320", name: "BHA", riskLevel: "high_risk", description: "Antioxydant synthétique" },
  E321: { code: "E321", name: "BHT", riskLevel: "high_risk", description: "Antioxydant synthétique" },

  // DANGEROUS (Rouge)
  E123: {
    code: "E123",
    name: "Amarante",
    riskLevel: "dangerous",
    description: "Colorant rouge interdit dans certains pays"
  },
  E128: { code: "E128", name: "Rouge 2G", riskLevel: "dangerous", description: "Colorant rouge interdit UE" },
  E154: { code: "E154", name: "Brun FK", riskLevel: "dangerous", description: "Colorant brun interdit" },
  E173: { code: "E173", name: "Aluminium", riskLevel: "dangerous", description: "Colorant métallique" },
  E180: { code: "E180", name: "Lithol-rubine BK", riskLevel: "dangerous", description: "Colorant rouge" },
  E214: {
    code: "E214",
    name: "4-hydroxybenzoate d'éthyle",
    riskLevel: "dangerous",
    description: "Conservateur interdit UE"
  },
  E216: {
    code: "E216",
    name: "4-hydroxybenzoate de propyle",
    riskLevel: "dangerous",
    description: "Conservateur interdit UE"
  },
  E217: {
    code: "E217",
    name: "4-hydroxybenzoate de propyle sodique",
    riskLevel: "dangerous",
    description: "Conservateur interdit UE"
  },
  E239: {
    code: "E239",
    name: "Hexaméthylène tétramine",
    riskLevel: "dangerous",
    description: "Conservateur interdit UE"
  },
  E924: {
    code: "E924",
    name: "Bromate de potassium",
    riskLevel: "dangerous",
    description: "Agent de traitement de la farine interdit"
  }
};

/**
 * Obtenir les informations d'un additif par son code
 */
export function getAdditiveInfo(code: string): Additive {
  const normalizedCode = code.toUpperCase().replace(/\s+/g, "");

  return (
    ADDITIVES_DATABASE[normalizedCode] || {
      code: normalizedCode,
      name: normalizedCode,
      riskLevel: "moderate",
      description: "Additif non répertorié"
    }
  );
}

/**
 * Obtenir la couleur HeroUI selon le niveau de risque
 */
export function getAdditiveRiskColor(
  riskLevel: AdditiveRiskLevel
): "success" | "warning" | "danger" | "default" {
  switch (riskLevel) {
    case "safe":
      return "success";
    case "moderate":
      return "warning";
    case "high_risk":
    case "dangerous":
      return "danger";
    default:
      return "default";
  }
}

/**
 * Obtenir le label français du niveau de risque
 */
export function getAdditiveRiskLabel(riskLevel: AdditiveRiskLevel): string {
  switch (riskLevel) {
    case "safe":
      return "Sans risque";
    case "moderate":
      return "Risque modéré";
    case "high_risk":
      return "Risque élevé";
    case "dangerous":
      return "Dangereux";
    default:
      return "Non évalué";
  }
}

/**
 * Parser les additifs depuis nutrition_score
 */
export function parseAdditives(nutritionScore: any): Additive[] {
  if (!nutritionScore?.additives || !Array.isArray(nutritionScore.additives)) {
    return [];
  }

  return nutritionScore.additives.map((additive: any) => {
    if (typeof additive === "string") {
      return getAdditiveInfo(additive);
    }

    if (additive.id) {
      const info = getAdditiveInfo(additive.id);
      // Override avec les données existantes si disponibles
      return {
        ...info,
        name: additive.name || info.name,
        riskLevel: additive.riskLevel || info.riskLevel
      };
    }

    return getAdditiveInfo("UNKNOWN");
  });
}
