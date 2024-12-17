import { generateCompletion } from "../services/openaiService.js";
import fs from "fs";
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

function generatePrompt(paragraph) {
    let promptTemplatePath = path.join(__dirname, "../data/prompts/imagesPrompt.txt");
    let promptTemplate = fs.readFileSync(promptTemplatePath, "utf8");

    promptTemplate = promptTemplate.replace("[Introduce el párrafo aquí]", paragraph);

    return splitPromptSections(promptTemplate);
}

function splitPromptSections(prompt) {
    const sections = {
        introduction: "",
        entry: ""
    };

    const parts = prompt.split("**Entrada:**");

    if (parts.length > 1) {
        sections.introduction = parts[0].trim();
        sections.entry = parts[1]
    }

    return sections;
}

export async function generateImages(script) {
    const prompt = generatePrompt(script);
    return generateCompletion(prompt.introduction, prompt.entry);
}

