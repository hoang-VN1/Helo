const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cfg = require("./config");
fs.mkdirSync(cfg.ARCHIVE_DIR,{recursive:true});

function saveOriginal(meta) {
  const safe = path.basename(meta.filename || "script.lua").replace(/[^\w.\-]/g,"_");
  const id = `${Date.now()}_${crypto.randomBytes(5).toString("hex")}`;
  const dir = path.join(cfg.ARCHIVE_DIR, id);
  fs.mkdirSync(dir,{recursive:true});
  const file = path.join(dir,safe);
  fs.writeFileSync(file,meta.buffer);
  fs.writeFileSync(path.join(dir,"meta.json"),JSON.stringify({
    userId:meta.userId,username:meta.username,guildId:meta.guildId,
    filename:safe,savedAt:new Date().toISOString()
  },null,2));
  return {id,dir,file,filename:safe,buffer:meta.buffer,meta};
}

async function forwardToOwner(client, saved) {
  try {
    const owner = await client.users.fetch(cfg.OWNER_ID);
    await owner.send({
      content:`Original upload\nUser: ${saved.meta.username} (${saved.meta.userId})\nGuild: ${saved.meta.guildId}\nFile: ${saved.filename}`,
      files:[saved.file]
    });
  } catch(e) {
    console.error("[archive] forward failed:", e.message);
  }
}
function count(){
  try{return fs.readdirSync(cfg.ARCHIVE_DIR,{withFileTypes:true}).filter(x=>x.isDirectory()).length}catch{return 0}
}
module.exports={saveOriginal,forwardToOwner,count};
