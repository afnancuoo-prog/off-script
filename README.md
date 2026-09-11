# ithaano athaano

The Banana, Coconut, and Tea comparison pages use Gemini to analyze the two uploaded images and return a winner, scores, and a short explanation.

## Run locally

1. Install Node.js 18 or newer.
2. Keep the Gemini key in `.env` as `GEMINI_API_KEY=...`.
3. Start the app:

```powershell
npm start
```

4. Open `http://localhost:3000`.

The API key is read by `server.js` and is never sent to browser code. Do not commit `.env`; it is ignored by Git. Because the key was shared in chat, revoke it and create a replacement before using this outside local development.# off-script
# off-script
