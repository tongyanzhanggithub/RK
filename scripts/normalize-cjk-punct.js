// Proofreading pass: normalize ASCII punctuation that sits next to Chinese
// characters into full-width forms, matching the existing zh style. Only matches
// when a CJK char is adjacent, so en/ar/ru/code lines are never touched.
const fs = require("fs");
const path = require("path");
const file = path.resolve(__dirname, "../lib/i18n.ts");
let src = fs.readFileSync(file, "utf8");
const CJK = "\\u4e00-\\u9fff";
const before = src;
const rules = [
  [new RegExp(`([${CJK}]),`, "g"), "$1，"],
  [new RegExp(`,([${CJK}])`, "g"), "，$1"],
  [new RegExp(`([${CJK}])\\?`, "g"), "$1？"],
  [new RegExp(`([${CJK}])!`, "g"), "$1！"],
  [new RegExp(`([${CJK}]):`, "g"), "$1："],
  [new RegExp(`([${CJK}])\\(`, "g"), "$1（"],
  [new RegExp(`\\(([${CJK}])`, "g"), "（$1"],
  [new RegExp(`([${CJK}])\\)`, "g"), "$1）"],
  [new RegExp(`\\)([${CJK}])`, "g"), "）$1"]
];
let count = 0;
for (const [re, rep] of rules) {
  src = src.replace(re, (...args) => {
    count++;
    return args[0].replace(/[,?!:()]/, (m) => ({ ",": "，", "?": "？", "!": "！", ":": "：", "(": "（", ")": "）" }[m]));
  });
}
if (src !== before) {
  fs.writeFileSync(file, src);
  console.log("normalized punctuation, replacements:", count);
} else {
  console.log("no changes");
}
