// PM2 进程配置 —— 在项目根目录执行：pm2 start deploy/ecosystem.config.js
// 常用：pm2 status / pm2 logs repairkit / pm2 reload repairkit / pm2 save
module.exports = {
  apps: [
    {
      name: "repairkit",
      // 用 npm start（= next start --hostname 127.0.0.1 --port 4173），只监听本机，由 Nginx 对外
      script: "npm",
      args: "start",
      cwd: "/var/www/repairkit",
      instances: 1, // 起步单实例；上量后可设 "max" 走 cluster（但需先把图片上传迁到 OSS，否则多实例本地磁盘不共享）
      exec_mode: "fork",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production"
        // 其余变量从项目根目录的 .env.production 读取（Next 会自动加载），
        // 或在此处显式列出。敏感值不要写进本文件（本文件会进 git）。
      }
    }
  ]
};
