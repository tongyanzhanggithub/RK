// 本地开发数据库（无需 Docker）：用 embedded-postgres 在本机起一个真实 PostgreSQL，
// 引擎与线上(阿里云 RDS PostgreSQL)一致，避免"本地能跑线上炸"。
//
// 用法：
//   终端 1：npm run db:local     # 启动本地数据库，保持开着
//   终端 2：npm run dev          # 启动网站
//
// 数据存在项目下的 .localdb/（已被 git 忽略）。连接串与 .env.example 一致：
//   postgresql://rk:rk_dev_password@localhost:5432/rk
const fs = require("fs");
const path = require("path");

process.env.LC_ALL = "C";
process.env.LANG = "C";
process.env.LC_CTYPE = "C";

const EP = require("embedded-postgres");
const EmbeddedPostgres = EP.default || EP;

const dataDir = path.join(__dirname, "..", ".localdb");
// 首次运行才 initdb；已存在数据目录则直接启动（否则 initdb 会因目录非空报错）。
const alreadyInitialised = fs.existsSync(dataDir) && fs.readdirSync(dataDir).length > 0;

(async () => {
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: "rk",
    password: "rk_dev_password",
    port: 5432,
    persistent: true,
    initdbFlags: ["--locale=C", "--encoding=UTF8"]
  });
  if (!alreadyInitialised) {
    await pg.initialise();
  }
  await pg.start();
  if (!alreadyInitialised) {
    try {
      await pg.createDatabase("rk");
    } catch {
      // 已存在则忽略
    }
  }
  console.log("✅ 本地 PostgreSQL 已启动：postgresql://rk:rk_dev_password@localhost:5432/rk");
  console.log("   保持此终端开着；Ctrl+C 停止。");

  const stop = async () => {
    try {
      await pg.stop();
    } catch {
      // ignore
    }
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  setInterval(() => {}, 1 << 30); // 保持进程存活
})().catch((error) => {
  console.error((error && error.message) || error || "未知错误");
  console.error("提示:若端口 5432 已被占用,可能 db:local 已在另一个终端运行(无需重复启动)。");
  process.exit(1);
});
