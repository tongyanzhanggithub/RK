import { prisma } from "@/lib/db";
import {
  problems as staticProblems,
  type DiagnosticNode,
  type Problem
} from "@/data/problems";

function parseArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseTree(value: string | null): DiagnosticNode | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && "question" in parsed ? (parsed as DiagnosticNode) : undefined;
  } catch {
    return undefined;
  }
}

type DbProblem = {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  timeEstimate: string;
  videoUrl: string | null;
  commonCauses: string;
  checkSteps: string;
  toolsNeeded: string;
  recommendedProductSlugs: string;
  affectedModels: string;
  decisionTree: string | null;
};

function toProblem(row: DbProblem): Problem {
  const difficulty = (["easy", "moderate", "advanced"] as const).includes(row.difficulty as never)
    ? (row.difficulty as Problem["difficulty"])
    : "moderate";
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    difficulty,
    timeEstimate: row.timeEstimate,
    videoUrl: row.videoUrl || undefined,
    commonCauses: parseArray(row.commonCauses),
    checkSteps: parseArray(row.checkSteps),
    toolsNeeded: parseArray(row.toolsNeeded),
    recommendedProductSlugs: parseArray(row.recommendedProductSlugs),
    affectedModels: parseArray(row.affectedModels),
    decisionTree: parseTree(row.decisionTree)
  };
}

/** Published troubleshooting guides, DB-first with a static fallback. */
export async function getTroubleshooting(): Promise<Problem[]> {
  try {
    const rows = await prisma.problem.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });
    if (rows.length > 0) return rows.map(toProblem);
  } catch {
    // fall through to static data
  }
  return staticProblems;
}

export async function getTroubleshootingGuide(slug: string): Promise<Problem | null> {
  try {
    const row = await prisma.problem.findFirst({ where: { slug, status: "PUBLISHED" } });
    if (row) return toProblem(row);
  } catch {
    // fall through
  }
  return staticProblems.find((problem) => problem.slug === slug) || null;
}
