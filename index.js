import { generateHook } from "./generators/hookGenerator.js";
import { generateImages } from "./generators/imageGenerator.js";
import { generateParagraph } from "./generators/paragraphGenerator.js";
import { generateScript } from "./generators/scriptGenerator.js";
import fs from "fs";
import { generateAudioFromParagraph } from "./services/elevenLabsService.js";
import path from "path";
import { mkdir } from "fs/promises";
import { createVideo } from "./services/createVideoService.js";

function getRandomNiche() {
    const niches = JSON.parse(fs.readFileSync("./data/bbdd/niches.json", "utf8"));
    const randomMainNiche = niches[Math.floor(Math.random() * niches.length)];
    const randomSubNiche =
        randomMainNiche.sub_niches[
            Math.floor(Math.random() * randomMainNiche.sub_niches.length)
        ];
    return {
        main_niche: randomMainNiche.main_niche,
        sub_niche: randomSubNiche,
    };
}

function getRandomDeadlySin() {
    const deadlySins = JSON.parse(fs.readFileSync("./data/bbdd/deadly_sins.json", "utf8"))
    const sins = deadlySins[Math.floor(Math.random() * deadlySins.length)];
    return sins;
}

function generateRandomID() {
    // Genera un número de 10 dígitos como string
    let id = '';
    for (let i = 0; i < 10; i++) {
        id += Math.floor(Math.random() * 10); // Genera un número aleatorio entre 0 y 9
    }
    return id;
}

async function createDir(id) {
// Crear la carpeta "audios" si no existe
    const audiosDir = path.join(process.cwd() + "/creations", id);
    await mkdir(audiosDir, { recursive: true });
}

(async () => {
    let ID = "3664026647";
    //let ID = generateRandomID();
    const randomNiche = getRandomNiche();
    const randomSin = getRandomDeadlySin();

    createDir(ID);
    console.log(`Generating hook for niche: ${randomNiche.main_niche} of subniche ${randomNiche.sub_niche} and sin: ${randomSin}`);

    try {
        const hook = await generateHook(randomNiche.main_niche, randomNiche.sub_niche, randomSin);
       // console.log("Generated Hook:\n", hook);
        let finalHook = hook.content.split("**Hook final generado:**")[1];
        // extraer el hook generado de hook.content y pasarlo al siguiente medoto
        const script = await generateScript(randomNiche.main_niche, randomNiche.sub_niche, randomSin, finalHook);
        // console.log("Generated Script:\n" + script.content);
        const paragraph = await generateParagraph(script.content, ID);
        console.log("Generated Paragraph:\n" + paragraph.content);
        //const imagenes = await generateImages(paragraph.content);
        //console.log("Generated Imagens :\n" + imagenes.content);

        // create images
        await generateAudioFromParagraph(paragraph.content, ID)
        //await createVideo(`/creation/${ID}`)
        //await createVideo(ID)
    } catch (error) {
        console.error("Error:", error);
    }
})();
