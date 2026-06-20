"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Problem } from "@prisma/client";
import type { ProblemFormState } from "@/app/admin/(protected)/problems/actions";

type Props = {
  problem?: Problem;
  action: (state: ProblemFormState, formData: FormData) => Promise<ProblemFormState>;
  submitLabel: string;
  saved?: boolean;
};

function arrayText(value?: string) {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join("\n") : "";
  } catch {
    return "";
  }
}

function treeText(value?: string | null) {
  if (!value) return "";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center bg-brand px-5 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      {pending ? "保存中..." : label}
    </button>
  );
}

export function ProblemForm({ problem, action, submitLabel, saved }: Props) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid gap-6">
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">已保存。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <section className="border border-line bg-white">
        <div className="border-b border-line p-5"><h2 className="text-xl font-black">基本信息</h2></div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field label="标题" name="title" required defaultValue={problem?.title} placeholder="发动机不着车" />
          <Field label="Slug（网址）" name="slug" defaultValue={problem?.slug} placeholder="留空将根据标题自动生成" />
          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            描述
            <textarea name="description" required rows={2} defaultValue={problem?.description} className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            难度
            <select name="difficulty" defaultValue={problem?.difficulty || "moderate"} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
              <option value="easy">简单</option>
              <option value="moderate">中等</option>
              <option value="advanced">较难</option>
            </select>
          </label>
          <Field label="预计耗时" name="timeEstimate" defaultValue={problem?.timeEstimate} placeholder="30–60 min" />
          <Field label="维修视频链接（YouTube，选填）" name="videoUrl" defaultValue={problem?.videoUrl || ""} placeholder="https://www.youtube.com/watch?v=..." />
          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-2 text-sm font-bold">
              状态
              <select name="status" defaultValue={problem?.status || "PUBLISHED"} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
                <option value="PUBLISHED">已发布</option>
                <option value="DRAFT">草稿</option>
              </select>
            </label>
            <Field label="排序" name="sortOrder" type="number" defaultValue={problem ? String(problem.sortOrder) : "0"} />
          </div>
        </div>
      </section>

      <section className="border border-line bg-white">
        <div className="border-b border-line p-5">
          <h2 className="text-xl font-black">内容（每行一条）</h2>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <ListField label="常见原因" name="commonCauses" defaultValue={arrayText(problem?.commonCauses)} placeholder="化油器脏\n火花塞老化" />
          <ListField label="下单前检查步骤" name="checkSteps" defaultValue={arrayText(problem?.checkSteps)} placeholder="检查火花塞\n确认有油到化油器" />
          <ListField label="所需工具" name="toolsNeeded" defaultValue={arrayText(problem?.toolsNeeded)} placeholder="火花塞扳手\n螺丝刀套装" />
          <ListField label="推荐维修件 slug" name="recommendedProductSlugs" defaultValue={arrayText(problem?.recommendedProductSlugs)} placeholder="168f-standard-repair-kit" />
          <ListField label="受影响发动机型号 slug" name="affectedModels" defaultValue={arrayText(problem?.affectedModels)} placeholder="168f\ngx160" />
        </div>
      </section>

      <section className="border border-line bg-white">
        <div className="border-b border-line p-5">
          <h2 className="text-xl font-black">交互式诊断树（高级，选填）</h2>
          <p className="mt-1 text-sm text-steel">
            粘贴 JSON 格式的诊断流程。不熟悉可留空 —— 留空则该故障页不显示交互诊断。
          </p>
        </div>
        <div className="p-5">
          <textarea
            name="decisionTree"
            rows={10}
            defaultValue={treeText(problem?.decisionTree)}
            placeholder='{"question":"有火花吗？","options":[{"label":"有","result":{"cause":"...","action":"...","productSlugs":["..."]}}]}'
            className="w-full border border-line px-3 py-2 font-mono text-xs leading-5 outline-none focus:border-navy"
          />
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end border-t border-line bg-white/95 p-4 backdrop-blur">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function Field({
  label, name, defaultValue, required, type = "text", placeholder
}: {
  label: string; name: string; defaultValue?: string; required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
    </label>
  );
}

function ListField({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue?: string; placeholder?: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <textarea name={name} rows={4} defaultValue={defaultValue} placeholder={placeholder} className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy" />
    </label>
  );
}
