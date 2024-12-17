import { OpenAI } from 'openai';
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Usa dotenv para cargar la clave
});

export async function generateCompletion(asctAs, prompt) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {"role": "system", "content": asctAs},
                {"role": "user", "content": prompt}
            ]
        });
        return completion.choices[0].message;
    } catch (error) {
        console.error('Error al llamar a la API de OpenAI:', error);
        throw error;
    }
}
  