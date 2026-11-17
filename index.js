const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');

// Khởi tạo Discord Bot với các quyền đọc tin nhắn
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Khởi tạo Express Server để nhận dữ liệu từ tool/game gửi lên Render
const app = express();
app.use(express.json());

// Biến lưu trữ kết quả tạm thời trên RAM
let latestResult = "Chưa có dữ liệu";

// 1. API nhận kết quả từ tool trên máy tính đẩy lên
app.post('/update', (req, res) => {
    const { result } = req.body;
    if (result) {
        latestResult = result;
        console.log(`Đã cập nhật kết quả mới: ${latestResult}`);
        return res.status(200).json({ success: true, message: "Cập nhật thành công!" });
    }
    return res.status(400).json({ success: false, message: "Thiếu dữ liệu result!" });
});

// Trang chủ kiểm tra server sống
app.get('/', (req, res) => {
    res.send('bot-gta5 is live!');
});

// Lắng nghe cổng trên Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Web server đã khởi động trên cổng ${PORT}`);
});

// 2. Khi Bot online thành công
client.once('ready', () => {
    console.log(`Đã online dưới tên: ${client.user.tag}`);
});

// 3. Xử lý lệnh chat từ Discord
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Lệnh !check để hiện khung Embed chuẩn Kéo/Búa/Bao
    if (message.content.trim() === '!check') {
        const embed = new EmbedBuilder()
            .setTitle('OTT BOT DREW')
            .setDescription(`**Đối Phương Đã Khóa: ${latestResult}**`)
            .setColor(0x2B2D31) // Màu nền tối đồng bộ Discord
            .setFooter({ text: 'bot by drew.2023' });

        try {
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("Lỗi gửi tin nhắn embed:", error);
        }
    }

    // Lệnh !help hướng dẫn
    if (message.content.trim() === '!help') {
        const embed = new EmbedBuilder()
            .setTitle('Hướng Dẫn Sử Dụng')
            .setDescription('Gõ `!check` để xem kết quả đối phương đã khóa.')
            .setColor(0x2B2D31)
            .setFooter({ text: 'bot by drew.2023' });

        await message.channel.send({ embeds: [embed] });
    }
});

// Đăng nhập Bot bằng Token
// Thay vì dùng process.env.DISCORD_TOKEN
client.login(process.env.DISCORD_TOKEN);
