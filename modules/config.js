const path = require("path");
module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  OWNER_ID: process.env.OWNER_ID || "1390532560794292315",
  DEFAULT_GUILD_ID: process.env.DEFAULT_GUILD_ID || "1536149700045049956",
  PREMIUM_ROLE_ID: process.env.PREMIUM_ROLE_ID || "1536154307290730527",
  OBF_API_URL: process.env.OBF_API_URL || "https://luacrack.site/",
  OBF_API_TOKEN: process.env.OBF_API_TOKEN || "",
  DEOBF_API_URL: process.env.DEOBF_API_URL || "",
  DEOBF_API_TOKEN: process.env.DEOBF_API_TOKEN || "",
  MAX_FILE_BYTES: Number(process.env.MAX_FILE_BYTES || 2097152),
  PREFIX: process.env.PREFIX || ".",
  FREE_PRESETS: ["Basic","Normal","Strong","Hard"],
  PREMIUM_PRESETS: ["MaxSecurity","M1","M2","M3","Ib1","Ib2","Ib3","Abyss","Abyss2"],
  DATA_DIR: path.join(__dirname, "..", "data"),
  ARCHIVE_DIR: path.join(__dirname, "..", "archive", "originals"),
  ADMIN_CHANNEL_ID: process.env.ADMIN_CHANNEL_ID || ""
};
