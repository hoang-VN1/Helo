const fs = require("fs");
const path = require("path");
const cfg = require("./config");
const file = path.join(cfg.DATA_DIR, "guilds.json");
let data = [];
try { data = JSON.parse(fs.readFileSync(file, "utf8")); } catch {}
if (!data.includes(cfg.DEFAULT_GUILD_ID)) { data.push(cfg.DEFAULT_GUILD_ID); save(); }
function save(){ fs.writeFileSync(file, JSON.stringify([...new Set(data)],null,2)); }
function isAllowed(id){ return data.includes(id); }
function add(id){ if(!data.includes(id)){data.push(id);save();} }
function remove(id){ data=data.filter(x=>x!==id);save(); }
function list(){ return [...data]; }
module.exports={isAllowed,add,remove,list};
