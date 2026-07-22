import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY belum tersedia.");
}

const ai = new GoogleGenAI({ apiKey });

const pager = await ai.models.list({
  config: {
    pageSize: 100,
  },
});

for await (const model of pager) {
  console.log(model.name);
}