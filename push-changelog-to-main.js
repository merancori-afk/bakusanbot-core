const { execSync } = require('child_process');
const fs = require('fs');

try {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

  // ステージを一旦クリア（安全策）
  execSync('git reset');

  // changelog.md の内容を一時保存
  const changelog = fs.readFileSync('changelog.md', 'utf8');

  // master に切り替え
  execSync('git checkout master');

  // changelog.md を上書き（作業ブランチの内容を master に反映）
  fs.writeFileSync('changelog.md', changelog);

  // changelog.md だけステージに追加してコミット
  execSync('git add changelog.md');
  execSync('git commit -m "更新履歴を master に反映"');
  execSync('git push origin master');

  // 元の作業ブランチに戻る
  execSync(`git checkout ${currentBranch}`);

  console.log(`✅ changelog.md を安全に master に反映しました（作業ブランチ: ${currentBranch}）`);
} catch (err) {
  console.error('❌ Git反映に失敗しました:', err.message);
}