#!/usr/bin/env bash
# 阿里云 ECS (Ubuntu 22.04) 一键初始化 —— 装 Node 20 / Nginx / PM2 / Certbot。
# 用法：以 root 或 sudo 执行  bash deploy/setup-ecs.sh
set -euo pipefail

echo ">>> 更新系统"
apt-get update -y && apt-get upgrade -y

echo ">>> 安装 Node.js 20 LTS"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo ">>> 安装 Nginx / Certbot / git / 构建工具"
apt-get install -y nginx certbot python3-certbot-nginx git build-essential

echo ">>> 安装 PM2（进程守护）"
npm install -g pm2
pm2 startup systemd -u "${SUDO_USER:-root}" --hp "/home/${SUDO_USER:-root}" || true

echo ">>> 防火墙：放行 80/443/22"
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
fi

echo ">>> 完成。版本："
node -v; npm -v; nginx -v; pm2 -v
echo ""
echo "下一步见 docs/部署-阿里云.md 第 4 步起（拉代码 → 配 .env.production → build → PM2 启动 → Nginx → HTTPS）。"
echo "提醒：阿里云安全组也要放行 80/443（控制台里配，和系统防火墙是两层）。"
