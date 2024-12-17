import { generateCompletion } from "../services/openaiService.js";
import fs from "fs";
import path from "path"
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* 
    Este script obtiene los datos necesarios para crear el hook.
    - pecado capital
    - nicho y subnicho
    - posibles 
*/

function generatePrompt(niche, sub_niche, capitalSin) {
    let promptTemplatePath = path.join(__dirname, "../data/prompts/hookPrompt.txt");
    let hooksPath = path.join(__dirname, "../data/bbdd/hooks.txt");
    let promptTemplate = fs.readFileSync(promptTemplatePath, "utf8");
    let hooksTemplate = fs.readFileSync(hooksPath, "utf8");
    let hooks = hooksTemplate.replaceAll("[niche]", niche)
    promptTemplate = promptTemplate.replace("[Introduce el nicho aquí]", niche);
    promptTemplate = promptTemplate.replace("[Introduce el sub nicho aquí]", sub_niche);
    promptTemplate = promptTemplate.replace("[Introduce el pecado capital aquí]", capitalSin);
    promptTemplate = promptTemplate.replace("[Hooks]", hooks);
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

export async function generateHook(niche, sub_niche, capitalSin) {
    const prompt = generatePrompt(niche, sub_niche, capitalSin);
    return generateCompletion(prompt.introduction, prompt.entry);
}

