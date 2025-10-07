const fs = require('fs');
const path = require('path');
const cacheFile = path.join(__dirname, '../cache.json');

function loadCache() {
  if (fs.existsSync(cacheFile)) {
    let cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    // 期限切れ & 古いキー形式を削除
    for (const key in cache) {
      const entry = cache[key];

      // 古いキー形式（httpで始まらないもの）は削除
      if (!key.startsWith("http")) {
        delete cache[key];
        continue;
      }

      // 期限切れ削除
      if (now - entry.timestamp > oneWeek) {
        delete cache[key];
      }
    }
    return cache;
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

module.exports = { loadCache, saveCache };