// 必要モジュール
const fs = require('fs');
const { Client, GatewayIntentBits, MessageFlags } = require('discord.js');
require('dotenv').config(); // ← 環境変数を使う前に必ずここで読み込む

// Discordクライアント初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ------------------------------
// 設定ファイル類
// ------------------------------
const TEST_MODE = false; // テストモード用になっていたためfalseで固定
const configFile = './config.json';
let config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {};
const usageFile = './usage.json';
let usageData = fs.existsSync(usageFile) ? JSON.parse(fs.readFileSync(usageFile, 'utf8')) : {};


// ------------------------------
// 起動時
// ------------------------------
client.once('ready', () => {
  console.log(`✅ ログイン完了: ${client.user.tag}`);
});

// ------------------------------
// スラッシュコマンド処理
// ------------------------------
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // 爆散コマンド
  if (interaction.commandName === '爆散') {
    const guildId = interaction.guild.id;
    const guildConfig = config[guildId] || {};
    const userId = interaction.user.id;
    const now = Date.now();
    const cooldown = 4 * 60 * 60 * 1000; // 【修正】4時間に設定

    // 【修正】クールダウン判定の前に、まずはVCにいるかチェック（すり抜けバグ防止）
    const vc = interaction.member.voice.channel;
    if (!vc) {
      return interaction.reply({
        content: 'VCにいないみたいだよ。VCに入ってから実行してね。',
        flags: MessageFlags.Ephemeral,
      });
    }

    // 【修正】TEST_MODEの判定を消し、常に厳格にクールダウンをチェックする
    const unlimitedRoles = guildConfig.UNLIMITED_ROLES || [];
    const hasUnlimited = unlimitedRoles.some(r => interaction.member.roles.cache.has(r));

    if (!hasUnlimited) {
      const lastUsed = usageData[userId] || 0;
      const elapsed = now - lastUsed;
      if (elapsed < cooldown) {
        const remaining = cooldown - elapsed;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        return interaction.reply({
          content: `💤 爆発装置は冷却中… あと **${hours}時間${minutes}分** 待ってね。`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    await interaction.reply("💣 爆散シークエンス開始…");

    setTimeout(async () => {
      await interaction.followUp("💥 爆散！！");

      const succeeded = [];
      const failed = [];

      for (const member of vc.members.values()) {
        if (member.id === client.user.id) continue;

        const immuneRoles = guildConfig.IMMUNE_ROLES || [];
        if (immuneRoles.some(r => member.roles.cache.has(r))) {
          failed.push(`${member.displayName}（爆発耐性を持っているため無傷）`);
          continue;
        }

        try {
          await member.voice.disconnect();
          succeeded.push(member.displayName);
        } catch (err) {
          failed.push(`${member.displayName}（${err.name}）`);
        }
      }

      const timestamp = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
      let result = `==============================\n` +
                   `【作戦報告書】\n` +
                   `発動者　　：${interaction.member.displayName}\n` +
                   `時刻　　　：${timestamp}\n` +
                   `------------------------------\n`;

      if (succeeded.length) {
        result += `対象の殺害に成功。\n` +
                  `殺害人数　：${succeeded.length}名\n` +
                  `被害者一覧：${succeeded.join(', ')}\n`;
      } else {
        result += `殺害対象は存在しなかったよ。\n`;
      }

      if (failed.length) {
        result += `殺害失敗　：${failed.join(', ')}\n`;
      }

      result += `==============================`;

      await interaction.followUp(result);

      // 【修正】爆発が成功した場合のみ、履歴をセーブする（TEST_MODEの罠を撤去）
      if (!hasUnlimited) {
        usageData[userId] = now;
        fs.writeFileSync(usageFile, JSON.stringify(usageData, null, 2));
      }
    }, 3000);
  }

  // 設定コマンド
  if (interaction.commandName === '設定') {
    const configCmd = require('./commands/設定.js');
    return configCmd.execute(interaction, config);
  }

  // 第五人格要約コマンド
  if (interaction.commandName === '第五人格') {
    const idvCmd = require('./commands/第五人格.js');
    return idvCmd.execute(interaction);
  }

  // 更新履歴コマンド
  if (interaction.commandName === '更新履歴') {
    const changelogCmd = require('./commands/更新履歴.js');
    return changelogCmd.execute(interaction);
  }
});

// ------------------------------
// ログイン
// ------------------------------
console.log("DISCORD_TOKEN length:", process.env.DISCORD_TOKEN?.length);
client.login(process.env.DISCORD_TOKEN);

// ------------------------------
// Keep-alive用の簡易Webサーバー
// ------------------------------
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot is alive!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Keep-alive server running on port ${PORT}`));