import { generateCompletion } from "../services/openaiService.js";
import fs from "fs";
import { writeFile } from 'fs/promises';
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* 
    Este script obtiene los datos necesarios para crear el paragrafo de lo que se va a decir.
    - nicho y subnicho
    - pecado capital
    - el hook generado 
*/

function generatePrompt(script) {
    let promptTemplatePath = path.join(__dirname, "../data/prompts/pharagraphPrompt.txt");
    let promptTemplate = fs.readFileSync(promptTemplatePath, "utf8");

    promptTemplate = promptTemplate.replace("[Introduce aquí el guion dividido en secciones como Hook, Problema, Desarrollo, Resolución y CTA]", script);

    return splitPromptSections(promptTemplate);
}

function splitPromptSections(prompt) {
    const sections = {
        introduction: "",
        entry: ""
    };

    const parts = prompt.split("**Guion de entrada:**");

    if (parts.length > 1) {
        sections.introduction = parts[0].trim();
        sections.entry = parts[1]
    }

    return sections;
}

export async function generateParagraph(script, id) {
    const prompt = generatePrompt(script);
    const response = await generateCompletion(prompt.introduction, prompt.entry);
    await writeStringToFile(`creations/${id}`, "paragraf", response.content);
    return response;
}

async function writeStringToFile(fileName, name, content) {
    try {
        // Construir la ruta completa del archivo
        const filePath = path.join(process.cwd() + "\\" + fileName, `${name}.txt`);
        
        // Escribir el contenido en el archivo
        console.log(filePath)
        await writeFile(filePath, content, 'utf8');

        console.log(`El archivo se ha creado correctamente en: ${filePath}`);
    } catch (error) {
        console.error("Error al escribir en el archivo:", error);
    }
}

