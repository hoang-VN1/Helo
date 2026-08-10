require("dotenv/config");

const {
  Client, GatewayIntentBits, Partials, AttachmentBuilder,
  PermissionsBitField
} = require("discord.js");

const cfg = require("./modules/config");
const store = require("./modules/store");
const access = require("./modules/access");
const archive = require("./modules/archive");
const obf = require("./modules/obfuscator");
const deobf = require("./modules/deobfuscator");
const guilds = require("./modules/guilds");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

function isOwner(id) { return id === cfg.OWNER_ID; }

async function denyIfGuildNotAllowed(message) {
  if (!message.guild) return false;
  return !guilds.isAllowed(message.guild.id);
}

async function archiveOriginal(message, buffer, filename) {
  const saved = archive.saveOriginal({
    userId: message.author.id,
    username: message.author.tag,
    guildId: message.guild?.id || "DM",
    filename,
    buffer
  });
  await archive.forwardToOwner(client, saved);
  return saved;
}

async function getAttachmentBuffer(att) {
  if (!att) throw new Error("Hãy đính kèm file Lua.");
  if (att.size > cfg.MAX_FILE_BYTES) throw new Error(`File vượt quá ${cfg.MAX_FILE_BYTES} bytes.`);
  const res = await fetch(att.url);
  if (!res.ok) throw new Error(`Không tải được file (${res.status}).`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > cfg.MAX_FILE_BYTES) throw new Error("File vượt quá giới hạn.");
  return buf;
}

async function handleObf(message, preset) {
  if (await denyIfGuildNotAllowed(message)) return message.reply("Bot chưa được cấp phép hoạt động ở server này.");
  const basic = access.checkBasic(message.author.id, message.guild?.id);
  if (!basic.ok) return message.reply(basic.message);
  if (!access.canUsePreset(message.member, preset)) {
    return message.reply("Preset này yêu cầu Premium role.");
  }

  const att = message.attachments.first();
  const buffer = await getAttachmentBuffer(att);
  if (!/\.(lua|txt)$/i.test(att.name || "")) return message.reply("Chỉ hỗ trợ file .lua hoặc .txt.");

  const saved = await archiveOriginal(message, buffer, att.name);
  await message.reply("Đã nhận file. Đang xử lý obfuscation...");

  try {
    const result = await obf.process(buffer, att.name, preset);
    const out = new AttachmentBuilder(result.buffer, { name: result.filename });
    await message.reply({ content: `Obfuscation hoàn tất — preset: **${preset}**`, files: [out] });
    store.addStat("obf");
  } catch (e) {
    await message.reply(`Obfuscation thất bại: ${e.message}`);
  }
}


client.on("ready", () => {
  console.log(`[Ninja Hub] ${client.user.tag}`);
  console.log(`[Ninja Hub] Guild allowlist: ${guilds.list().join(", ") || "(none)"}`);
});

client.on("guildCreate", async guild => {
  if (!guilds.isAllowed(guild.id)) {
    try { await guild.leave(); } catch {}
  }
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(cfg.PREFIX)) return;

  const parts = message.content.trim().split(/\s+/);
  const cmd = parts.shift().slice(cfg.PREFIX.length).toLowerCase();

  try {
    if (cmd === "help" || cmd === "?") {
      return message.reply([
        "**Ninja Hub**",
        "`.obf <preset>` + file — obfuscate",
        "`.premium` — kiểm tra Premium",
        "`.presets` — danh sách preset",
        "`.credits` — xem credit",
        "`.hosting add <guild_id>` — Owner",
        "`.hosting remove <guild_id>` — Owner",
        "`.hosting list` — Owner",
        "`.stats` — thống kê"
      ].join("\n"));
    }

    if (cmd === "presets") return message.reply(obf.presets().join(", "));

    if (cmd === "credits") {
      return message.reply(`Credits: **${store.getUser(message.author.id).credits}**`);
    }

    if (cmd === "premium") {
      const ok = access.isPremium(message.member);
      return message.reply(ok
        ? "Premium: **ACTIVE** — bạn có quyền dùng preset obfuscation nâng cao."
        : "Premium: **INACTIVE** — hãy có Premium role để dùng preset nâng cao.");
    }

    if (cmd === "stats") {
      return message.reply(`Obf: **${store.stats.obf}** | Deobf: **${store.stats.deobf}** | Originals: **${archive.count()}**`);
    }

    if (cmd === "obf") {
      const preset = parts[0] || "Normal";
      return handleObf(message, preset);
    }

    if (cmd === "hosting") {
      if (!isOwner(message.author.id)) return message.reply("Owner only.");
      const sub = (parts.shift() || "").toLowerCase();
      if (sub === "add") {
        const id = parts[0];
        if (!/^\d{17,20}$/.test(id)) return message.reply("Guild ID không hợp lệ.");
        guilds.add(id);
        return message.reply(`Đã allow guild **${id}**. Bot vẫn cần được invite vào server đó bởi người có quyền.`);
      }
      if (sub === "remove") {
        const id = parts[0];
        guilds.remove(id);
        return message.reply(`Đã remove guild **${id}** khỏi allowlist.`);
      }
      if (sub === "list") return message.reply(guilds.list().map(x => `• ${x}`).join("\n") || "Không có guild.");
      return message.reply("Dùng `.hosting add <guild_id>`, `.hosting remove <guild_id>`, `.hosting list`.");
    }

  } catch (e) {
    console.error(e);
    try { await message.reply(`Lỗi: ${e.message}`); } catch {}
  }
});

client.login(cfg.BOT_TOKEN);
