import fs from 'fs';
import path from 'path';

/**
 * Función que verifica si un archivo existe, lo carga y devuelve su contenido.
 * @param {string} folderPath - La ruta de la carpeta donde está el archivo.
 * @param {string} fileName - El nombre del archivo txt.
 * @returns {string|null} - El contenido del archivo como string, o null si no existe.
 */
export function loadTextFile(folderPath, fileName) {
  // Construye la ruta absoluta al archivo
  const filePath = path.join(folderPath, fileName);

  // Comprueba si el archivo existe
  if (fs.existsSync(filePath)) {
    console.log(`Archivo encontrado: ${filePath}`);
    // Lee el contenido del archivo
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } else {
    console.error(`El archivo no existe: ${filePath}`);
    return null;
  }
}