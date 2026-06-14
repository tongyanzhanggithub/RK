// 后台状态枚举 → 中文显示标签。数据库与逻辑里仍用英文枚举值，这里只负责“显示”。
// 用法：import { zhLabel, PRODUCT_STATUS } from "@/lib/admin-status";  {zhLabel(PRODUCT_STATUS, product.status)}

export const PRODUCT_STATUS: Record<string, string> = {
  ACTIVE: "在售",
  DRAFT: "草稿",
  ARCHIVED: "已归档"
};

export const ORDER_PAYMENT_STATUS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已付款",
  FAILED: "支付失败",
  REFUNDED: "已退款"
};

export const ORDER_STATUS: Record<string, string> = {
  PROCESSING: "处理中",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
};

export const FULFILLMENT_STATUS: Record<string, string> = {
  UNFULFILLED: "未履约",
  PARTIALLY_FULFILLED: "部分履约",
  FULFILLED: "已履约"
};

export const CUSTOMER_STATUS: Record<string, string> = {
  ACTIVE: "正常",
  VIP: "VIP",
  BLOCKED: "已封禁"
};

export const CUSTOMER_ROLE: Record<string, string> = {
  CUSTOMER: "零售客户",
  WHOLESALE: "批发客户"
};

export const COUPON_TYPE: Record<string, string> = {
  PERCENTAGE: "百分比折扣",
  FIXED_AMOUNT: "固定金额",
  FREE_SHIPPING: "免运费"
};

export const COUPON_STATUS: Record<string, string> = {
  ACTIVE: "生效",
  INACTIVE: "停用",
  EXPIRED: "已过期",
  SCHEDULED: "未开始"
};

export const WHOLESALE_STATUS: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝"
};

export const INVENTORY_TYPE: Record<string, string> = {
  RESTOCK: "补货",
  RETURN: "退货入库",
  DAMAGE: "损耗",
  SALE: "销售出库",
  CORRECTION: "盘点校正"
};

export function zhLabel(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return "";
  return map[value] ?? value;
}
