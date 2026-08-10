# Ninja Hub — Final

## 1. Chuẩn bị
- Node.js 18.17+.
- Một Discord Bot Application.
- Bot token mới.
- Obfuscation API hợp lệ mà bạn có quyền sử dụng.

## 2. Cài đặt
```bash
npm install
```

Copy `.env.example` thành `.env`, sau đó điền:
- `BOT_TOKEN`: token bot mới.
- `OBF_API_URL`: endpoint obfuscation.
- `OBF_API_TOKEN`: API token.
- `OWNER_ID=1390532560794292315`
- `DEFAULT_GUILD_ID=1536149700045049956`
- `PREMIUM_ROLE_ID=1536154307290730527`

## 3. Kích hoạt bot
```bash
npm start
```

Nếu thấy:
```text
[Ninja Hub] BotName#0000
```
thì bot đã đăng nhập.

## 4. Discord permissions
Khi mời bot, cấp tối thiểu:
- View Channels
- Send Messages
- Attach Files
- Read Message History

Message Content Intent và Server Members Intent cần bật trong Discord Developer Portal nếu bot dùng các intent tương ứng.

## 5. Lệnh
```text
.help
.presets
.premium
.obf Basic       + file.lua
.obf Normal      + file.lua
.obf Strong      + file.lua
.obf Hard        + file.lua
.obf MaxSecurity + file.lua   # Premium
.stats
.credits

.hosting add <guild_id>       # Owner
.hosting remove <guild_id>    # Owner
.hosting list                 # Owner
```

## 6. Quyền Free / Premium
Free vẫn dùng các preset có mức làm rối đáng kể: Basic, Normal, Strong, Hard.
Premium mở các preset nâng cao như MaxSecurity, M1/M2/M3, Ib1/Ib2/Ib3, Abyss/Abyss2.

## 7. Lưu file gốc
Mỗi file gửi cho `.obf` được lưu trong:
```text
archive/originals/
```
Bot cũng cố gắng gửi bản gốc cho Owner qua DM.

## 8. Lưu ý
Không commit `.env` vào Git hoặc gửi token vào chat. Nếu token cũ từng bị lộ, hãy reset token trong Discord Developer Portal trước khi chạy production.


## Android/Termux
Xem `TERMUX.md`. Có thể chạy `./termux-install.sh`, `npm run setup`, rồi `./start.sh`.


## Render deployment

This bot is configured as a Render Background Worker, not a Web Service.

1. Push this project to a private GitHub repository.
2. In Render choose **New > Background Worker** and select the repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add `BOT_TOKEN` and `OBF_API_TOKEN` as secret environment variables.
6. Deploy.

### File originals on Render

Render's local filesystem is not a permanent storage layer. The bot therefore:
- immediately forwards each original upload to the Owner's Discord DM;
- keeps a local copy only for the lifetime of the running instance;
- does not commit originals or `.env` to Git.

If permanent archival is required later, add S3/R2/Supabase storage and store only object keys/metadata in the bot.
