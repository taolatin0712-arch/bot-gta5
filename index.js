const express = require('express');
const app = express();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// Web server giữ bot luôn online trên Koyeb
app.get('/', (req, res) => res.send('Bot GTA5VN đang hoạt động!'));
app.listen(process.env.PORT || 8000, () => {
  console.log('Web server đã khởi động!');
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let lichSuKetQua = [];
const PREFIX = '!';
// (Tùy chọn) Dán ID kênh Discord bắn log kết quả game vào trong dấu nháy đơn bên dưới
const LOG_CHANNEL_ID = 'https://discord.gg/a7fbSVnzX';

client.once('ready', () => {
  console.log(`Đã online dưới tên: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Tự động đọc & lưu tin nhắn từ kênh Log
  if (message.channel.id === LOG_CHANNEL_ID && message.author.id !== client.user.id) {
    const noiDung = message.content || (message.embeds[0] ? message.embeds[0].description : '');
    if (noiDung) {
      lichSuKetQua.unshift({
        thoiGian: new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        chiTiet: noiDung
      });
      if (lichSuKetQua.length > 100) lichSuKetQua.pop();
    }
  }

  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Lệnh: !check hoặc !check <tên/từ khóa>
  if (command === 'check') {
    const keyword = args.join(' ').toLowerCase();

    const ketQuaTimThay = keyword
      ? lichSuKetQua.filter(item => item.chiTiet.toLowerCase().includes(keyword)).slice(0, 5)
      : lichSuKetQua.slice(0, 5);

    if (ketQuaTimThay.length === 0) {
      return message.reply(`Chưa có dữ liệu kết quả nào${keyword ? ` cho **${keyword}**` : ''}.`);
    }

    const danhSachText = ketQuaTimThay
      .map((item, index) => `**${index + 1}.** [${item.thoiGian}] ${item.chiTiet}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x00FF99)
      .setTitle(`📊 KẾT QUẢ GTA5VN ${keyword ? `- ${keyword.toUpperCase()}` : '(GẦN NHẤT)'}`)
      .setDescription(danhSachText)
      .setFooter({ text: `Tổng dữ liệu đang lưu: ${lichSuKetQua.length} trận` });

    message.channel.send({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
