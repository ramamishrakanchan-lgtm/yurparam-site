const HF_SPACE_API = "https://25f3001314-ayurparam-api.hf.space/gradio_api/call/chat";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const headers = { "Content-Type": "application/json" };

  try {
    const postRes = await fetch(HF_SPACE_API, {
      method: "POST",
      headers,
      body: JSON.stringify(req.body)
    });
    const postJson = await postRes.json();
    const eventId = postJson.event_id;
    if (!eventId) {
      res.status(502).json({ error: "No event_id from HF", detail: postJson });
      return;
    }

    const getRes = await fetch(`${HF_SPACE_API}/${encodeURIComponent(eventId)}`);
    const text = await getRes.text();

    let answer = null;
    let errorDetail = null;
    const events = text.split(/\r?\n\r?\n/);
    for (const event of events) {
      const lines = event.split(/\r?\n/);
      const name = lines.find(l => l.startsWith("event:"))?.slice(6).trim();
      const data = lines.find(l => l.startsWith("data:"))?.slice(5).trim();
      if (name === "complete" && data) {
        const parsed = JSON.parse(data);
        answer = Array.isArray(parsed) ? parsed[0] : parsed;
      }
      if (name === "error") {
        errorDetail = data || "null";
      }
    }

    if (answer) {
      res.status(200).json({ answer });
    } else {
      res.status(502).json({ error: "Gradio error", detail: errorDetail, raw: text });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
