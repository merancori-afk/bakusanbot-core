const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('更新履歴')
    .setDescription('Botの更新履歴（最新3件）を表示します'),

  async execute(interaction) {
    const logFile = './changelog.md';
    if (!fs.existsSync(logFile)) {
      return interaction.reply({ content: '更新履歴ファイルが見つかりません。', ephemeral: true });
    }

    const content = fs.readFileSync(logFile, 'utf8');

    // ✅ 先頭の「〖更新履歴一覧〗」を削除
    // ✅ changelog.md 内にある「📄 全件はこちら」行も削除
    const cleaned = content
      .replace(/^〖更新履歴一覧〗\s*/m, '')
      .replace(/📄 全件はこちら[\s\S]*/m, '');

    // ✅ 「〖YYYY/MM/DD〗」または「〖YYYY/MM/DD β〗」で分割
    const entries = cleaned.split(/(?=^〖\d{4}\/\d{2}\/\d{2}(?: β)?〗)/m);

    // ✅ 最新3件だけ抽出
    const latest = entries.slice(0, 3).join('\n').trim();

    // ✅ Discord用に「〖日付〗」を「**日付**」に変換して見やすく
    const formatted = latest.replace(/〖(\d{4}\/\d{2}\/\d{2}(?: β)?)〗/g, '**$1**');

    // ✅ Discord用のメッセージを組み立て
    const message = `〖更新履歴〗\n\n${formatted}\n\n📄 全件はこちら → https://github.com/merancori-afk/bakusanbot-update-history/blob/main/changelog.md`;

    await interaction.reply(message);
  }
};