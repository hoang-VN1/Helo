const cfg = require("./config");
function isPremium(member) {
  return !!member?.roles?.cache?.has(cfg.PREMIUM_ROLE_ID);
}
function checkBasic(userId, guildId) {
  if (!guildId) return {ok:false,message:"Lệnh chỉ dùng trong server Discord."};
  const guilds = require("./guilds");
  if (!guilds.isAllowed(guildId)) return {ok:false,message:"Server chưa được Owner cấp phép."};
  return {ok:true};
}
function canUsePreset(member, preset) {
  const p = String(preset).toLowerCase();
  if (cfg.PREMIUM_PRESETS.some(x => x.toLowerCase() === p)) {
    return isPremium(member);
  }
  return cfg.FREE_PRESETS.some(x => x.toLowerCase() === p);
}
module.exports={isPremium,checkBasic,canUsePreset};
