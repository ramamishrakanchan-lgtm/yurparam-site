# AyurParam

A chatbot for learning basic Ayurveda concepts and classical Sanskrit/Ayurvedic terminology.

Built by **Team Kayakalp** (Ashutosh Shri Mishra, Shravani Gawade) as a proposal submission for **Techfest 2026-27's AyushTech Innovate: National Open Ayurveda AI Challenge** (IIT Bombay, Ministry of Ayush, AIIA).

> This README was written with AI assistance (Claude) based on this project's own test results and the model publisher's own published paper, as an honest, evidence-backed account of the project — not marketing copy.

---

## 1. Status: Proposal-stage research prototype

This is **not a finished product** and it is **not a medical tool**. It is an early prototype built to demonstrate, with evidence, where an off-the-shelf Ayurveda LLM is and isn't reliable today, and what a responsible next step (source-grounded retrieval) looks like.

## 2. Live links

| What | Link |
|---|---|
| Chatbot (frontend) | https://yurparam-site.vercel.app |
| Model backend (Hugging Face Space) | https://huggingface.co/spaces/25f3001314/ayurparam-api |
| Base model | https://huggingface.co/bharatgenai/AyurParam |
| Research paper | https://arxiv.org/abs/2511.02374 |

## 3. What this chatbot is for

- Basic-level curiosity about Ayurveda concepts (Dosha, Dhatu, Agni, Panchamahabhuta, etc.)
- Learners interested in Sanskrit / classical Ayurvedic vocabulary and terminology
- Students and researchers wanting a general, non-prescriptive introduction to Ayurveda as a subject
- A reference starting point for further reading — not a source of final answers

## 4. What this chatbot is explicitly NOT for (today)

- **It cannot currently be used as a practitioner-facing or clinical bot.** It must not be used by or for a practitioner, patient, or anyone making a real health decision.
- No diagnosis, treatment planning, or remedy/medication guidance of any kind
- No accuracy claim on Panchakarma, procedural, or disease-specific questions
- No use as a substitute for a qualified Ayurveda practitioner or doctor

This limitation is not a guess — it is based on both the model publisher's own benchmark and our own independent testing (Section 6).

## 5. Model details

- **Base model:** [`bharatgenai/AyurParam`](https://huggingface.co/bharatgenai/AyurParam) — 2.9B parameters
- **Fine-tuned from:** Param-1-2.9B-Instruct ([arXiv:2507.13390](https://arxiv.org/abs/2507.13390))
- **Training data:** A curated Ayurveda dataset built from digitized classical texts (e.g. Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya), clinical guidance, and roughly 4.75M generated question–answer pairs, bilingual (English + Hindi), fine-tuned using supervised fine-tuning (SFT) on an H100 GPU cluster.
- **Publisher:** BharatGen Team

### Research paper

**"AyurParam: A State-of-the-Art Bilingual Language Model for Ayurveda"** — Mohd Nauman, Sravan Gvm, Vijay Devane, Shyam Pawar, Viraj Thakur, Kundeshwar Pundalik, Piyush Sawarkar, Rohit Saluja, Maunendra Desarkar, Ganesh Ramakrishnan (BharatGen Team), submitted 4 Nov 2025.
📄 https://arxiv.org/abs/2511.02374

## 6. Benchmark: the publisher's own numbers

AyurParam-2.9B was evaluated on **BhashaBench-Ayur (BBA)**, the publisher's own 14,963-question Ayurveda exam benchmark spanning 15+ subject domains (9,348 English + 5,615 Hindi questions).

| Split | Accuracy |
|---|---|
| Overall (BBA) | 39.97% |
| English | 41.12% |
| Hindi | 38.04% |
| Easy questions | 43.93% |
| Hard questions | 31.21% |

State-of-the-art for its size class (beats Llama-3.2-3B-Instruct and Qwen2.5-3B-Instruct in the same parameter range) — but still wrong on roughly 6 of every 10 structured questions.

**Authors' own stated limitations:**
- No explicit safety mechanisms against inappropriate or harmful medical advice
- Responses are knowledge-grounded but not clinically validated
- Does not account for patient history, contraindications, or individual health context
- Training texts digitized before 2024; limited exposure to recent research
- Classical source texts carry their own cultural biases, which the model may reflect
- A measurable **Hindi-vs-English performance gap** — Hindi queries lag English queries (this is exactly what shows up as the language-non-compliance behavior described below; it is a known, published limitation of the base model, not a bug introduced by this frontend)

## 7. Our own independent testing

251 live questions were put to the deployed AyurParam chatbot; **150 (59.8%) were flagged** as likely off-topic, hallucinated, or self-contradicting.

**Documented failure patterns:**

1. **Language non-compliance** — explicit "answer only in Hindi" instructions were ignored; answers came back in English. (Matches the publisher's own documented Hindi/English accuracy gap — see Section 6.)
2. **Repetition collapse** — short/ambiguous prompts ("hii", "kya") caused the model to loop on a single token until output was cut off
3. **Self-generated fake Q&A** — the model invented and answered its own follow-up questions the user never asked
4. **Training-data leakage** — on confusing prompts, the model recited memorized, unrelated content from its training mix (once even claiming to be "an AI developed by OpenAI"; another time replying with unrelated Bollywood-film trivia to a one-word prompt)
5. **Confident fabrication** — on a correctly-scoped, on-topic question, the model invented precise-sounding but unverifiable specifics, with no uncertainty flagged, despite being explicitly instructed to say "don't know" when unsure
6. **No topic/domain restriction** — the chatbot answered fully unrelated requests (e.g. writing a story, generating scraping code) with no refusal or redirection back to Ayurveda

Reliability varies a lot by topic — classical-text/terminology questions are the most reliable; Panchakarma/procedural questions are the least.

Full breakdown, charts, test code, and screenshot evidence: see the project's **[Honest Positioning & Safety Evidence document](https://claude.ai/artifact/YU18Xuz9yQ4gAggQdxrG77)**.

## 8. Why the Hindi/English issue specifically happens

This is not something this frontend introduced. The base model's own publisher reports a measurable accuracy gap between English (41.12%) and Hindi (38.04%) on identical benchmark questions — the model is simply less reliable in Hindi than in English at the weight level. On top of that, our own testing found the model sometimes ignores an explicit "reply only in Hindi" instruction entirely and answers in English regardless of what was asked. Until the model is grounded in retrieval (Section 9) or further fine-tuned specifically for instruction-following in Hindi, this cannot be fully fixed from the frontend side — it can only be partially mitigated (e.g., re-prompting, output-language detection and retry).

## 9. Planned fix: RAG grounding

The next step is to ground AyurParam's answers in retrieval over classical texts (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya) instead of relying on the model's unaided recall, so every answer can be traced back to a cited passage. This directly matches the AyushTech Innovate challenge's requirement for source-grounded, hallucination-free solutions with documented safety-verification protocols.

## 10. Deployment architecture and known infrastructure limits

### How the pieces connect

```
Browser  ->  Vercel (static index.html)
         ->  Vercel serverless proxy (/api/chat)
         ->  Hugging Face Space (Gradio app, ZeroGPU)  ->  AyurParam model
```

- **Frontend:** a single `index.html` served by Vercel.
- **Proxy:** `api/chat.mjs` is a Vercel serverless function. It submits the question to the Space's Gradio API and waits for the answer in the same call, then returns `{ "answer": ... }`.
- **Backend:** the Hugging Face Space `25f3001314/ayurparam-api` loads `bharatgenai/AyurParam` (about 10 GB of weights) and runs it on ZeroGPU, Hugging Face's shared free GPU pool.

### What went wrong during setup (and how each issue was fixed)

| Symptom | Cause | Fix |
| --- | --- | --- |
| `POST /ask 404` | The live site still called an old endpoint that the Space no longer had | Switched to the Gradio API (`/gradio_api/call/chat`) |
| Generic "Maaf kijiye..." reply, no detail | The frontend discarded the real error | Error detail is now logged / returned by the proxy |
| `/api/chat` returned "Not found", then `FUNCTION_INVOCATION_FAILED` | Vercel did not detect the function, then could not find its export | Added `vercel.json`; converted the handler to an ES module (`.mjs`) |
| `event: error` with `data: null` | ZeroGPU GPU quota exhausted (see below) | See options below |

### Why ZeroGPU calls fail with `data: null`

- ZeroGPU gives each **signed-in account** or, for anonymous calls, each **IP address** a small daily GPU quota.
- When the proxy sent our Hugging Face token, every request used our account's quota, which ran out after a day of testing.
- Without a token, every visitor's request reaches the Space from **Vercel's IP**, so all users share one small anonymous quota.
- Gradio hides the real error text on its API by default, so the only visible message is `data: null`. The Space now launches with `show_error=True` so the real reason is shown.
- Each call now reserves 30 seconds of GPU time (`@spaces.GPU(duration=30)`) instead of the default 60, so the same quota covers more calls.

### Why not Render or Streamlit Cloud?

The bottleneck is the GPU, not web hosting. The model needs roughly 10 GB of memory and a GPU. The free tiers of Render and Streamlit Community Cloud offer about 1 GB of RAM and no GPU, so the model cannot load there. They could only host the frontend, which Vercel already does.

### Options to make the chatbot reliable

1. **Call the Space directly from the browser (free):** remove the proxy so each visitor uses their own IP's quota instead of one shared pool.
2. **Hugging Face PRO:** a much larger daily ZeroGPU allowance; the most reliable choice for a demo day.
3. **Google Colab + tunnel (free, demo only):** run the model on Colab's free GPU and expose it through a Cloudflare tunnel. It stops when the Colab session ends.
4. **Paid GPU Space:** dedicated hardware billed per hour, no shared quota.

**Current status:** the proxy path works when quota is available and returns an error when it is used up. Switching to direct browser calls (option 1) is the planned next step, with option 3 as a demo-day backup.

## 11. Team

**Kayakalp**
- Ashutosh Shri Mishra — Leader
- Shravani Gawade

## 12. Disclaimer

AyurParam is an educational/research prototype for learning Ayurveda terminology and basic concepts. It is **not** a certified medical device or clinical decision-support tool, has **no** explicit safety mechanisms against harmful medical advice, and must **not** be used for diagnosis, treatment, remedy, or medication guidance. For any real health concern, consult a qualified, registered Ayurveda practitioner or doctor.