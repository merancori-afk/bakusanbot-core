const { exec } = require('child_process');
const chokidar = require('chokidar');

chokidar.watch('./changelog.md').on('change', () => {
  console.log('changelog.md が更新されました。自動コミット＆プッシュします…');
  exec('git add changelog.md && git commit -m "changelog 自動更新" && git push origin main',
    (err, stdout, stderr) => {
      if (err) {
        console.error('エラー:', stderr);
      } else {
        console.log(stdout);
      }
    });
});