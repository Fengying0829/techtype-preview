export default {
  async fetch(request, env) {
    const allowedOrigins = [
      "https://fengying0829.github.io",
      "http://127.0.0.1:8010"
    ];

    const origin = request.headers.get("Origin") || "";
    const allowOrigin = allowedOrigins.includes(origin)
      ? origin
      : "https://fengying0829.github.io";

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return json({ error: "Only POST is allowed" }, 405, corsHeaders);
    }

    if (!env.DEEPSEEK_API_KEY) {
      return json({ error: "DEEPSEEK_API_KEY is not configured" }, 500, corsHeaders);
    }

    try {
      const result = await request.json();
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          thinking: { type: "disabled" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(result) }
          ],
          response_format: { type: "json_object" },
          temperature: 0.85,
          max_tokens: 1400,
          stream: false
        })
      });

      if (!response.ok) {
        const detail = await response.text();
        return json({ error: "DeepSeek request failed", detail }, 502, corsHeaders);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || "{}";
      const aiBlocks = normalizeAIBlocks(JSON.parse(rawContent));
      return json(aiBlocks, 200, corsHeaders);
    } catch (error) {
      return json({ error: "AI feedback failed", detail: String(error) }, 500, corsHeaders);
    }
  }
};

const systemPrompt = `
你是一个科技职场测评点评助手。你基于固定测评规则的结果，为用户生成个性化中文点评。

要求：
1. 总字数控制在 500-1000 个中文字符。
2. 风格参考 MBTI：有趣、有记忆点、适合分享，但不能玄学化。
3. 表达要合理、科学、克制，不做心理诊断，不做招聘筛选。
4. 不要说“你一定”“你天生只能”“你不可能”。
5. 必须引用用户的人格类型、四维倾向、雷达分数、岗位 Top 3 和置信度。
6. 内容包含：一句话点评、核心优势、你和别人不同的地方、岗位解释、可能盲区、未来 30 天行动建议。
7. 输出 JSON，不要 Markdown，不要代码块。

JSON 格式必须是：
{
  "summary": "一句话点评，40-90字",
  "strength": "核心优势，120-220字",
  "difference": "你和别人不同的地方，90-170字",
  "jobs": "岗位解释，120-220字",
  "blindspot": "可能盲区，90-170字",
  "actions": "未来30天行动建议，120-220字"
}
`;

function normalizeAIBlocks(data) {
  return {
    summary: safeText(data.summary),
    strength: safeText(data.strength),
    difference: safeText(data.difference),
    jobs: safeText(data.jobs),
    blindspot: safeText(data.blindspot),
    actions: safeText(data.actions)
  };
}

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}
