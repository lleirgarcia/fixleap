import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";

// Variables globales
let page;
let IMAGES_NUMBER = 0;

let imageRowsLocators = '[id="pageScroll"] [class*="flex-col-reverse"]';
let imageColsLocators = '[class="relative group"]';
let imageRowsProcess = '[id="pageScroll"] [class*="flex-col-reverse"] [class*="absolute"] span[class*="inline-block"]';

/**
 * Función principal que toma un párrafo y ejecuta el flujo de automatización.
 * @param {string} paragraph - El texto que se convertirá en prompts.
 */
export const generateImagesFromParagraph = async (paragraph) => {
    const parsedImages = parseParagraphToImages(paragraph);
    await connectToExistingBrowser();
    await createImages(parsedImages);
    console.log("Automatización completada.");
};

/**
 * Descompone el párrafo en un array de prompts para generar imágenes.
 * @param {string} paragraph - Texto completo.
 * @returns {Array} - Array de objetos con prompts.
 */
function parseParagraphToImages(paragraph) {
    const sentences = paragraph
        .split(".")
        .filter((sentence) => sentence.trim().length > 0);

    return sentences.map((sentence) => ({
        record: sentence.trim(),
    }));
}

async function connectToExistingBrowser() {
    const browser = await chromium.connectOverCDP("http://localhost:9222");
    const contexts = browser.contexts();

    if (contexts.length > 0) {
        console.log("Contextos encontrados. Reutilizando una pestaña existente.");
        const existingPages = contexts[0].pages();
        page = existingPages.length > 0 ? existingPages[0] : await contexts[0].newPage();
    } else {
        console.log("No se encontraron contextos. Creando uno nuevo.");
        const context = await browser.newContext();
        page = await context.newPage();
    }

    await page.waitForSelector("#desktop_input_bar");
}

async function createImages(images) {
    await page.click('[href="/imagine"]');
    const chunkedImages = chunkArray(images, 5);

    for (const chunk of chunkedImages) {
        console.log(`Procesando un nuevo lote de ${chunk.length} imágenes...`);

        for (const image of chunk) {
            try {
                await generateImageByPrompt(image["record"]);
            } catch (err) {
                console.error(`Error al procesar la imagen: ${image}`, err);
            }
        }

        console.log("Prompts enviados");
        await page.waitForTimeout(5000);
        await downloadPromptedImages(chunk);
    }

    console.log("Todas las imágenes han sido procesadas.");
}

async function generateImageByPrompt(prompt) {
    await page.fill("#desktop_input_bar", prompt);
    await page.keyboard.press("Enter");
    console.log(`Prompt enviado: ${prompt}`);
}

async function downloadPromptedImages(currentImagesPrompted) {
    console.log("Descargando imágenes...");
    const images = page.locator(imageRowsLocators);

    for (let i = 0; i < currentImagesPrompted.length; i++) {
        IMAGES_NUMBER++;
        const row = images.nth(i);
        const colImages = await row.locator(imageColsLocators);
        const colCount = await colImages.count();

        for (let j = 0; j < colCount; j++) {
            const col = colImages.nth(j);
            await col.click({ button: "right" });
            await page.locator("text=Share & Save").click();
            await page.waitForTimeout(3000);
            await page.locator("text=Copy Image URL").nth(0).click();

            const clipboardText = await page.evaluate(async () => {
                return await navigator.clipboard.readText();
            });

            const fileName = `${IMAGES_NUMBER}_${j}`;
            try {
                await downloadLocal(clipboardText, fileName);
            } catch (err) {
                console.error("Error al descargar la imagen:", err);
            }
        }
    }
}

async function downloadLocal(imageURL, outputPath) {
    const imagesDir = path.join(process.cwd(), "images");
    await fs.mkdir(imagesDir, { recursive: true });

    const imageBufferArray = await page.evaluate(async ({ url }) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(buffer));
    }, { url: imageURL });

    const imageBuffer = Buffer.from(imageBufferArray);
    const fullOutputPath = path.join(imagesDir, `${outputPath}.png`);
    await fs.writeFile(fullOutputPath, imageBuffer);
    console.log(`Imagen guardada en: ${fullOutputPath}`);
}

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
