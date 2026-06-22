"use client";

import { useFormState, useFormStatus } from "react-dom";
import { sendCampaign, type NewsletterFormState } from "./actions";

function SendButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || count === 0}
      className="inline-flex h-11 items-center justify-center bg-brand px-5 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      {pending ? "发送中..." : `群发给 ${count} 位订阅者`}
    </button>
  );
}

export function CampaignForm({ count }: { count: number }) {
  const initial: NewsletterFormState = {};
  const [state, action] = useFormState(sendCampaign, initial);

  return (
    <form action={action} className="grid gap-4">
      {typeof state.sent === "number" && (
        <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">
          已发送 {state.sent} 封邮件。
        </p>
      )}
      {state.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        邮件主题
        <input
          name="subject"
          required
          placeholder="本月配件特惠 / 新到货通知"
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        正文（纯文本，空行分段）
        <textarea
          name="body"
          required
          rows={8}
          placeholder={"您好，\n\n本周 168F / GX160 维修套件批发价直降 12%，新到 3 寸水泵机封套件……\n\n回复本邮件即可询价。"}
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-steel">仅发送给“有效”状态的订阅者；逐封发送,不互相暴露邮箱。需服务器已配置 SMTP。</p>
        <SendButton count={count} />
      </div>
    </form>
  );
}
