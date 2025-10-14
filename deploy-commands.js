// deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const foldersPath = './commands';
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = `${foldersPath}/${folder}`;
  const commandFiles = fs.statSync(commandsPath).isDirectory()
    ? fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    : [folder]; // 単独ファイルの場合

  for (const file of commandFiles) {
    const filePath = fs.statSync(commandsPath).isDirectory()
      ? `${commandsPath}/${file}`
      : `${foldersPath}/${file}`;

    const commandModule = require(filePath);
    // 配列対応
    const commandList = Array.isArray(commandModule) ? commandModule : [commandModule];

    for (const cmd of commandList) {
      if ('data' in cmd) {
        commands.push(cmd.data.toJSON());
      }
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`📡 ${commands.length} 件のスラッシュコマンドを Global 登録します…`);

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // ← Global 登録に変更
      { body: commands },
    );

    console.log('✅ Global スラッシュコマンドの登録が完了しました！');
    console.log('⚠️ 反映には最大1時間かかる場合があります');
  } catch (error) {
    console.error('❌ 登録失敗:', error);
  }
})();