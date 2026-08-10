const fs = require("fs");
const path = require("path");
const cfg = require("./config");
const file = path.join(cfg.DATA_DIR, "users.json");
const statsFile = path.join(cfg.DATA_DIR, "stats.json");
fs.mkdirSync(cfg.DATA_DIR, {recursive:true});

function load(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}
const users = load(file, {});
const stats = Object.assign({obf:0,deobf:0}, load(statsFile, {}));

function save() { fs.writeFileSync(file, JSON.stringify(users,null,2)); }
function saveStats() { fs.writeFileSync(statsFile, JSON.stringify(stats,null,2)); }

function getUser(id) {
  if (!users[id]) users[id] = {credits: 5, createdAt: Date.now()};
  save();
  return users[id];
}
function addStat(k) { stats[k] = (stats[k] || 0) + 1; saveStats(); }
module.exports = {users, stats, getUser, addStat};
