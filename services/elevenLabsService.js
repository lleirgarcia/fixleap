import { ElevenLabsClient } from "elevenlabs";
import dotenv from "dotenv";
import { mkdir } from "fs/promises";
import { v4 as uuid } from "uuid"; // Generador de IDs únicos
import { createWriteStream } from "fs";
import path from "path";
import { loadTextFile } from "../utils/utils.js";

dotenv.config();

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

/**
 * Genera un archivo de audio a partir de un texto proporcionado.
 * @param {string} paragraph - El texto del cual se generará el archivo de audio.
 * @returns {Promise<string>} - La ruta completa del archivo de audio generado.
 */
export const generateAudioFromParagraph = async (paragraph, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let file = path.join(process.cwd() + "/creations", id);
console.log("a " + file)

            let paragraphLocal = loadTextFile(file, "paragraf.txt")
            if(paragraphLocal) {
                paragraph = paragraphLocal;
            }

            console.log("Generate audio from paragraph...")
            // Generar el audio usando ElevenLabs
            const audio = await client.generate({
                voice: "Will",
                model_id: "eleven_multilingual_v2",
                text: paragraph,
            });

            // Crear la carpeta "audios" si no existe
            const audiosDir = path.join(process.cwd(), "audios");
            await mkdir(audiosDir, { recursive: true });

            // Generar un nombre único para el archivo de audio
            // TODO cambiar el nombre del audio a "audio.mp3" ya que siempre será unico en la carpeta /creations
            const fileName = `${uuid()}.mp3`;
            const filePath = path.join(audiosDir, fileName);
            const filePathID = path.join(`creations/${id}`, fileName);

            // Crear un flujo de escritura para guardar el archivo de audio
            const fileStream = createWriteStream(filePath);
            const fileStreamID = createWriteStream(filePathID);

            // Canalizar el audio al archivo
            audio.pipe(fileStream);
            audio.pipe(fileStreamID);

            fileStream.on("finish", () => {
                console.log(`Archivo de audio creado: ${filePath}`);
                resolve(filePath);
            });

            fileStream.on("error", (err) => {
                console.error("Error al guardar el archivo de audio:", err);
                reject(err);
            });
        } catch (error) {
            console.error("Error al generar el archivo de audio:", error);
            reject(error);
        }
    });
};


// Texto de ejemplo
let paragraph = `
Are your cravings messing up your life? That insatiable desire is sabotaging your minimalist dreams—do you feel overwhelmed? 
First, get rid of what you don’t need and focus your attention on what truly excites you. If it doesn’t spark joy, let it go! 
Then, set clear boundaries, like the "one in, one out" rule: did you buy a new shirt? Donate the old one. 
Finally, prioritize experiences over things, because memories last longer than any gadget. 
Remember, minimalism isn’t about deprivation—it’s about making space for what truly matters. Simplicity brings serenity. 
Ready to leave the excess behind? Start today! Hit "like" if you’re committed to minimalism and follow us for more intentional living tips.
`;