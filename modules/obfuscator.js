const axios = require("axios");
const FormData = require("form-data");
const cfg = require("./config");

const PRESETS = [
  "Minify","Luamin","Format","Beautify","Env Logger","Me","Flow","Evil",
  "Abyss","Abyss2","Hex","Weak","Light","Ps","Rz","R2","Veil","L1","L2",
  "Ib1","Ib2","Ib3","Lightrew","Wrd","Ibv","Medium","M1","M2","M3",
  "Basic","Normal","Ibs","Hard","Strong","Env","Hidden","MaxSecurity"
];

function normalize(p){
  const found = PRESETS.find(x => x.toLowerCase() === String(p).toLowerCase());
  if(!found) throw new Error(`Preset không tồn tại. Dùng .presets để xem danh sách.`);
  return found;
}

async function process(buffer, filename, preset){
  const p = normalize(preset);
  if(!cfg.OBF_API_TOKEN) throw new Error("OBF_API_TOKEN chưa được cấu hình.");
  const form = new FormData();
  form.append("file", buffer, {filename});
  form.append("preset", p);
  form.append("action", "create_obf");
  const res = await axios.post(cfg.OBF_API_URL, form, {
    headers:{...form.getHeaders(), Authorization:`Bearer ${cfg.OBF_API_TOKEN}`},
    maxBodyLength:Infinity, maxContentLength:Infinity, timeout:120000,
    validateStatus:s=>s>=200&&s<500
  });
  if(res.status>=400) throw new Error(`Obfuscator API HTTP ${res.status}`);
  let out;
  if(Buffer.isBuffer(res.data)) out=res.data;
  else if(typeof res.data==="string") out=Buffer.from(res.data);
  else if(res.data?.file) out=Buffer.from(res.data.file,"base64");
  else if(res.data?.code) out=Buffer.from(res.data.code);
  else throw new Error("API không trả về file/code hợp lệ.");
  const watermark = Buffer.from("-- This file was protected using bot Ninja Hub community (https://discord.gg/U3euTqAabv)\\n");
  if(!out.toString("utf8").startsWith("-- This file was protected using bot Ninja Hub community"))
    out = Buffer.concat([watermark,out]);
  return {buffer:out, filename:`NinjaHub_${filename.replace(/\.[^.]+$/,"")}.lua`};
}
module.exports={process,presets:()=>PRESETS};
