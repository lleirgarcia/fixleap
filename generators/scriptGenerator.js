import { generateCompletion } from "../services/openaiService.js";
import fs from "fs";
import path from "path"
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* 
    Este script obtiene los datos necesarios para crear el hook.
    - nicho y subnicho
    - pecado capital
    - el hook generado 
*/

function generatePrompt(niche, sub_niche, capitalSin, hook) {
    let promptTemplatePath = path.join(__dirname, "../data/prompts/scriptPrompt.txt");
    let promptTemplate = fs.readFileSync(promptTemplatePath, "utf8");

    promptTemplate = promptTemplate.replace("[Introduce el nicho aquí]", niche);
    promptTemplate = promptTemplate.replace("[Introduce el sub nicho aquí]", sub_niche);
    promptTemplate = promptTemplate.replace("[Introduce el pecado capital aquí]", capitalSin);
    promptTemplate = promptTemplate.replace("[Hook]", hook);
    return splitPromptSections(promptTemplate);
}

function splitPromptSections(prompt) {
    const sections = {
        introduction: "",
        entry: ""
    };

    const parts = prompt.split("**Estructura del Guion (máximo 60 segundos):**");

    if (parts.length > 1) {
        sections.introduction = parts[0].trim();
        sections.entry = parts[1]
    }

    return sections;
}

export async function generateScript(niche, sub_niche, capitalSin, hook) {
    const prompt = generatePrompt(niche, sub_niche, capitalSin, hook);
    return generateCompletion(prompt.introduction, prompt.entry);
}

