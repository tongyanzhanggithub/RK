"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type ProblemFormState = {
  error?: string;
};

const problemSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z
    .string()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 只能是小写字母、数字和连字符。"),
  description: z.string().min(2).max(2000),
  difficulty: z.enum(["easy", "moderate", "advanced"]),
  timeEstimate: z.string().max(60).optional(),
  videoUrl: z.string().max(300).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  sortOrder: z.coerce.number().int().min(0).max(9999)
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Split a textarea into a clean string array (one item per line or comma).
function lines(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 50);
}

function problemDataFromForm(formData: FormData) {
  const title = text(formData, "title");
  const slug = text(formData, "slug") || slugify(title);
  const parsed = problemSchema.safeParse({
    title,
    slug,
    description: text(formData, "description"),
    difficulty: text(formData, "difficulty") || "moderate",
    timeEstimate: text(formData, "timeEstimate") || undefined,
    videoUrl: text(formData, "videoUrl") || undefined,
    status: text(formData, "status") || "DRAFT",
    sortOrder: text(formData, "sortOrder") || "0"
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "请检查标题、slug、描述与状态。" };
  }

  // Validate optional decision tree JSON.
  const treeRaw = text(formData, "decisionTree");
  let decisionTree: string | null = null;
  if (treeRaw) {
    try {
      const parsedTree = JSON.parse(treeRaw);
      if (!parsedTree || typeof parsedTree !== "object" || !("question" in parsedTree)) {
        return { error: "诊断树 JSON 必须是包含 question 字段的对象。" };
      }
      decisionTree = JSON.stringify(parsedTree);
    } catch {
      return { error: "诊断树不是有效的 JSON。请留空或粘贴正确的 JSON。" };
    }
  }

  const p = parsed.data;
  return {
    data: {
      title: p.title,
      slug: p.slug,
      description: p.description,
      difficulty: p.difficulty,
      timeEstimate: p.timeEstimate ?? "",
      videoUrl: p.videoUrl ?? null,
      status: p.status,
      sortOrder: p.sortOrder,
      commonCauses: JSON.stringify(lines(text(formData, "commonCauses"))),
      checkSteps: JSON.stringify(lines(text(formData, "checkSteps"))),
      toolsNeeded: JSON.stringify(lines(text(formData, "toolsNeeded"))),
      recommendedProductSlugs: JSON.stringify(lines(text(formData, "recommendedProductSlugs"))),
      affectedModels: JSON.stringify(lines(text(formData, "affectedModels"))),
      decisionTree
    }
  };
}

function revalidateProblemRoutes() {
  revalidatePath("/admin/problems");
  revalidatePath("/problems");
  revalidatePath("/engines");
}

export async function createProblem(_prev: ProblemFormState, formData: FormData): Promise<ProblemFormState> {
  await requireAdmin();
  const result = problemDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let problem;
  try {
    problem = await prisma.problem.create({ data: result.data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "无法创建（slug 可能已存在）。" };
  }

  revalidateProblemRoutes();
  redirect(`/admin/problems/${problem.id}/edit?saved=1`);
}

export async function updateProblem(
  problemId: string,
  _prev: ProblemFormState,
  formData: FormData
): Promise<ProblemFormState> {
  await requireAdmin();
  const result = problemDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let problem;
  try {
    problem = await prisma.problem.update({ where: { id: problemId }, data: result.data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "无法更新故障内容。" };
  }

  revalidateProblemRoutes();
  redirect(`/admin/problems/${problem.id}/edit?saved=1`);
}

export async function deleteProblem(problemId: string) {
  await requireAdmin();
  await prisma.problem.delete({ where: { id: problemId } });
  revalidateProblemRoutes();
  redirect("/admin/problems");
}
