import json, re, torch, spaces, gradio as gr
from huggingface_hub import snapshot_download
from transformers import AutoTokenizer, LlamaForCausalLM

path = snapshot_download("bharatgenai/AyurParam", local_dir="ayurparam",
                          ignore_patterns=["*.py"])
cfg = json.load(open(f"{path}/config.json"))
cfg["architectures"] = ["LlamaForCausalLM"]
cfg["model_type"] = "llama"
cfg.pop("auto_map", None)
json.dump(cfg, open(f"{path}/config.json", "w"), indent=2)

tok = AutoTokenizer.from_pretrained(path)
model = LlamaForCausalLM.from_pretrained(path, torch_dtype=torch.bfloat16)
model.eval()

RISKY_WORDS = ["upay", "ilaj", "upchar", "cure", "bukhar", "fever", "dard", "pain",
               "stress", "udaas", "akela", "depress", "chinta", "dawai", "medicine"]

SYSTEM_PROMPT = (
    "तुम केवल आयुर्वेद के विषय मुं उत्तर देते हो, सिर्फ हिंदी में, संक्षेप में। "
    "अगर सवाल आयुर्वेद से संबंधित नहीं है तो विनम्रता से मना करो। "
    "अगर तुम्हें हही जवाब पक्का नहीं पता, तो साफ़ कहो 'मुझे इसकी पक्की जानकारी नहीं है' — कभी अंदाज़ा या मनगढ़ंत जवाब मत दो।\n\n"
)

def clean_answer(text):
    text = re.split(r"\s0[A-Za-z]?\s*:", text)[0]
    text = re.split(r"\b\d+\s+of\s+\d+\b", text)[0]
    text = text.strip()
    if not text:
        text = "Maaf kijiye, is sawaal ka saaf jawab nahi mil paaya. Kripya dusre shabdon mein poochhein."
    return text

@spaces.GPU
def chat(message, history):
    try:
        if any(w in message.lower() for w in RISKY_WORDS):
            return ("Main sirf Ayurveda ke concepts (dosha, dincharya, jadi-booti, panchakarma) samjha sakta hoon. "
                    "Kisi bimari ya mansik tanaav ke liye kripya qualified doctor se salah lein.")
        model.to("cuda")
        msgs = [{"role": "user", "content": SYSTEM_PROMPT + message}]
        inp = tok.apply_chat_template(msgs, add_generation_prompt=True,
              return_tensors="pt", return_dict=True).to("cuda")
        out = model.generate(
            **inp, max_new_tokens=220,
            do_sample=True, temperature=0.4, top_p=0.85,
            repetition_penalty=1.3, no_repeat_ngram_size=3,
        )
        answer = tok.decode(out[0][inp["input_ids"].shape[1]:], skip_special_tokens=True)
        return clean_answer(answer)
    except Exception as e:
        import traceback
        return "DEBUG ERROR: " + type(e).__name__ + ": " + str(e) + " || " + traceback.format_exc()[-500:]

demo = gr.ChatInterface(chat, title="AyurParam")
demo.launch()
