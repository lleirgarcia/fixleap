import { chromium } from 'playwright';
import fs from 'fs/promises'; 
import path from 'path';

//Primero he de abrir un navegador "pre existente" teniendo chromium descargado:
// Luego hay que abrir ese navegador con: 
// "C:\Users\lleir\projects\fixleap\chrome\win64-131.0.6778.108\chrome-win64\chrome.exe" --remote-debugging-port=9222

let page;
let IMAGES_NUMBER = 0;

async function connectToExistingBrowser() {
    // Conéctate al navegador en modo CDP
    const browser = await chromium.connectOverCDP('http://localhost:9222');

    // Obtener todos los contextos disponibles en el navegador conectado
    const contexts = browser.contexts();

    if (contexts.length > 0) {
        console.log('Contextos encontrados. Reutilizando una pestaña existente.');

        // Buscar la primera página abierta en los contextos disponibles
        const existingPages = contexts[0].pages();
        if (existingPages.length > 0) {
            page = existingPages[0]; // Reutilizar la primera pestaña encontrada
        } else {
            console.log('No se encontraron páginas abiertas. Creando una nueva.');
            page = await contexts[0].newPage(); // Crear una nueva página en el contexto existente
        }

    } else {
        console.log('No se encontraron contextos. Creando uno nuevo.');
        const context = await browser.newContext(); // Crear un nuevo contexto si no hay ninguno disponible
       
        page = await context.newPage(); // Crear una nueva página en el nuevo contexto

    }

   
    
    await page.waitForSelector('#desktop_input_bar'); // Selector por ID

    const images = [
        {
            "record": "Realista y vibrante, alta luminosidad, con fondos dinámicos: Una figura encadenada por libros de texto, simbolizando la carga de la deuda estudiantil."
        },
        {
            "record": "Ilustrativo y contrastante, colores vibrantes, textura abstracta: Una puerta abierta con cadenas rotas, representando la liberación de la deuda."
        },
        {
            "record": "Minimalista y monocromático, luminosidad intermedia: Un calendario con símbolos de pagos quincenales marcados, destacando el consejo financiero."
        },
        {
            "record": "Caricaturesco y pastel, alta luminosidad: Una caricatura de un prestamista amistoso mostrando porcentajes de interés más bajos."
        },
        {
            "record": "Futurista y vibrante, luminosidad alta, elementos abstractos: Una figura volando sobre un gráfico de barras que disminuye, simbolizando la conquista de deudas."
        }
    ]
    

    createImages(images);
    console.log('Acción completada en la pestaña.');
}

let imageRowsLocators = '[id="pageScroll"] [class*="flex-col-reverse"]';
let imageColsLocators = '[class="relative group"]';
let imageRowsProcess = '[id="pageScroll"] [class*="flex-col-reverse"] [class*="absolute"] span[class*="inline-block"]';

/*
    1. Escribir y generar imagenes de 3 en 3.
    2. Espero a que se cargen.
    3. Descargo todas las imagenes de la linea.
    4. Cambio el nombre del archivo local al prompt que le he pasado.ç
    5. Vuelvo a iniciar.

*/
async function createImages(images) {
    await page.click('[href="/imagine"]');

    // primero busco todo 
    // he de dar un tiempo de descanso entre busqueda
    // luego de las N que he generado, recoger el "click derecho -> share and save -> save image"
    const chunkedImages = chunkArray(images, 5);

    for (const chunk of chunkedImages) {
        console.log(`Procesando un nuevo lote de ${chunk.length} imágenes...`);

        // 1.envio las primeras 5 imagenes
        for (const image of chunk) {
            try {
               // generateImageByPrompt(image["record"])
            } catch (err) {
                console.error(`Error al procesar la imagen: ${image}`, err);
            }
        }
        console.log("Prompts enviados")
        // 2. espero que se carguen
        //await waitAllImagesLoaded();
        // 3. descargo las imagenes
        await downloadPromptedImages(chunk);

        process.exit(1)
        // 4. cambio el nombre en local por el prompt
        // siguientes 5 imagenes

        
        await page.waitForTimeout(5000); // Espera 5 segundos entre lotes
    }

    console.log('Todas las imágenes han sido procesadas.');
}

async function generateImageByPrompt(prompt) {
    await page.fill('#desktop_input_bar', prompt);
    await page.keyboard.press('Enter'); // Envía la tecla Enter
    console.log(`TexPrompt enviado: ${prompt}`);
}

async function waitAllImagesLoaded() {
    console.log("Waiting for load images");
    await page.waitForTimeout(50000); // Espera 20 segundos (20000 milisegundos)


    /*
    // Localiza los elementos
    const locator = page.locator(imageRowsProcess);
    const count = await locator.count();

    if (count > 0) {
        // Obtén el primer elemento como elementHandle
        const elementHandle = await locator.nth(0).elementHandle();
        if (elementHandle) {
            console.log("Esperando a que el primer elemento se elimine...");
            await elementHandle.waitForElementState('hidden', { timeout: 100000 });
            console.log("El primer elemento se eliminó.");
        } else {
            console.error("No se pudo obtener el elementHandle del primer elemento.");
        }
    } else {
        console.log("No hay elementos disponibles en el locator.");
    }
    */
}


async function downloadLocal(imageURL, outputPath) {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json'
        };


        // Crear directorio 'images' si no existe
        const imagesDir = path.join(process.cwd(), 'images'); 
        try {
            await fs.mkdir(imagesDir, { recursive: true });
        } catch (err) {
            console.error('Error al crear el directorio "images":', err);
            return;
        }

        // Descargar la imagen usando fetch en el contexto del navegador
        const imageBufferArray = await page.evaluate(async ({ url, headers }) => {
        const response = await fetch(url, { method: 'GET', headers });
        const buffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(buffer)); // Convertir en Array serializable
    }, { url: imageURL, headers });

    // Convertir el Array en Buffer válido
    const imageBuffer = Buffer.from(imageBufferArray);

    // Construir ruta completa de la imagen
    const fullOutputPath = path.join(imagesDir, `${outputPath}.png`);

    // Guardar la imagen en el directorio 'images'
    try {
        await fs.writeFile(fullOutputPath, imageBuffer);
        console.log(`Imagen descargada correctamente en: ${fullOutputPath}`);
    } catch (err) {
        console.error('Error al guardar la imagen:', err);
    }
}

async function downloadPromptedImages(currentImagesPrompted) {
    console.log("Downloading images");

    const images = page.locator(imageRowsLocators);
    
    for (let i = 0; i < currentImagesPrompted.length; i++) {
        IMAGES_NUMBER++;
        const row = images.nth(i);
        const colImages = await row.locator(imageColsLocators);
        const colCount = await colImages.count();

        for (let j = 0; j < colCount; j++) {
            const col = colImages.nth(j);
            await col.click({ button: 'right' });
            await page.locator('text=Share & Save').click();
            await page.waitForTimeout(3000); 
            await page.locator('text=Copy Image URL').nth(0).click();

            const clipboardText = await page.evaluate(async () => {
                return await navigator.clipboard.readText();
            });

            console.log(clipboardText);

            //const words = imagesPrompted[indexFromEnd]["record"]
            //.replace(/[.,:]/g, '') 
            //.split(' ')            
            //.filter(word => word.length > 3);
    
        // Palabras relevantes por orden (puedes ajustarlo con lógica más compleja)
       // const keywords = words.slice(0, 3);
       // let fileName = keywords.join(' ');


            // Obtener el nombre de la imagen desde el array (de último a primero)
            //const imagesPromptedName = imagesPrompted[indexFromEnd]["record"].replaceAll(" ", "");
            let fileName = IMAGES_NUMBER + "_" + j;
            console.log("IMAG")
            try {
                await downloadLocal(clipboardText, fileName);
            } catch (err) {
                console.error('Error al descargar la imagen:', err);
            }
            console.log(`Imagen descargada con éxito como "${clipboardText}".`);
        }
    }
}


function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

connectToExistingBrowser().catch(err => console.error('Error:', err));





const images = [
    {
        "record": "Realista y vibrante, alta luminosidad, con fondos dinámicos: Una figura encadenada por libros de texto, simbolizando la carga de la deuda estudiantil."
    },
    {
        "record": "Ilustrativo y contrastante, colores vibrantes, textura abstracta: Una puerta abierta con cadenas rotas, representando la liberación de la deuda."
    },
    {
        "record": "Minimalista y monocromático, luminosidad intermedia: Un calendario con símbolos de pagos quincenales marcados, destacando el consejo financiero."
    },
    {
        "record": "Caricaturesco y pastel, alta luminosidad: Una caricatura de un prestamista amistoso mostrando porcentajes de interés más bajos."
    },
    {
        "record": "Futurista y vibrante, luminosidad alta, elementos abstractos: Una figura volando sobre un gráfico de barras que disminuye, simbolizando la conquista de deudas."
    }
]