import os
from flask import Flask, jsonify, request
from dotenv import load_dotenv

from services.openai_service import generate_response

load_dotenv()

app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify({"status": "ok"})

@app.post("/webhook")
def webhook():
    payload = request.get_json(silent=True) or {}
    user_message = payload.get("message", "")

    if not user_message:
        return jsonify({"reply": "No message provided."}), 400

    reply = generate_response(user_message)
    return jsonify({"reply": reply})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
