const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function summarizeWithGemini(text) {
  try {
    // ✅ v1形式で呼び出す
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
あなたは第五人格のアップデート情報を要約するアシスタントです。
以下のルールに従って要約してください：

1. すべての前提として、新規SSR衣装(携帯品)、新規UR衣装(携帯品)は必ず記述してください。割引の旨はは記載する必要はありません。
   - 配布かショップ販売か
   - 欠片で買えるのか
   - エコー限定か
2. SSR衣装解放カードが登場した場合と、人格調整が行われた場合は後述4.に記載の記述不要項目でも必ず記載してください。
3. 記事最初の方の全般的な事柄（配布アイテム等）を序盤に『簡潔に』要約してください。メインではないので。
4. 以下の項目は一切記述不要です。ただし衣装情報は例外で必ず記載してください：
   - 不具合修正項目すべて、大会系（IVL, IJL, COA等）、幻像迷路、コンテンツアップデート、公共マップ、
     イベントショップ、キャラの日、交流システム、友好度ショップ商品新着、森のお伽噺、イベント系
5. ゲーム改善の項目で、以下の単語を含む文章は要約に含めないでください：
   - 居館、最適化、ロジック、公共マップ、ペン先の空想、演繹タスク、衣装コレクション図鑑、説明、親密関係、回想の壁、
     その他対戦バランスに直接関わらない些事
6. 出力はDiscordに貼れるように、箇条書き形式で簡潔にまとめてください。
7. 来週のアップデートに関しても同じルールで端的に要約してください。
8. すべての娯楽モードに関しては、「新○○」のように新たに実装される事柄以外（当然前述した例外も除く）一切の記述は不要です。ただし、協力狩りモードを除きます。
9. 補足ですが、似たような文言に注意してください。これは一例にすぎませんが、「人格調整」と「降霊術師調整」は全く異なります（人格調整をまとめるべき）。項目5も参照の上まとめてください。
10. 絵文字なども適度に使用し、単調すぎる文面にならないようにしてください。

--- アップデート本文 ---
${text}
    `;

    // ✅ v1形式の呼び出し
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    return result.response.text();
  } catch (err) {
    console.error("Gemini要約エラー:", err);
    return "要約の生成に失敗しました。";
  }
}

module.exports = summarizeWithGemini;
