const HF_SPACE_API = "https://25f3001314-ayurparam-api.hf.space/gradio_api/call/chat";

export default async function handler(req, res) {
  const token = process.env.HF_TOKEN;

  if (req.method === "POST") {
    try {
      const hfRes = await fetch(HF_SPACE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(req.body)
      });
      const data = await hfRes.json();
      res.status(hfRes.status).json(data);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
    return;
  }

  if (req.method === "GET") {
    const eventId = req.query.event_id;
    if (!eventId) {
      res.status(400).json({ error: "Missing event_id" });
      return;
    }
    try {
      const hfRes = await fetch(`${HF_SPACE_API}/${encodeURIComponent(eventId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await hfRes.text();
      res.status(hfRes.status).setHeader("Content-Type", "text/event-stream");
      res.send(text);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
