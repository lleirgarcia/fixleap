import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

/**
 * Función para crear un video a partir de imágenes y audio dentro de una carpeta.
 * @param {string} folderPath - Ruta de la carpeta que contiene imágenes, audio y donde se generará el video.
 * @param {number} [imageDuration=2] - Duración de cada imagen en segundos.
 */
export async function createVideo(id, imageDuration = 2) {
  const dir = process.cwd() + "/creations/" + id;
  const imagePattern = path.join(dir, 'frame%03d.png');
  const audioFile = path.join(dir, 'audio.mp3'); 
  const outputVideo = path.join(dir, `output_${id}.mp4`); 
  const framerate = 1 / imageDuration; 

  // Verificar existencia de archivos requeridos
  if (!fs.existsSync(audioFile)) {
    console.error(`Error: No se encontró el archivo de audio: ${audioFile}`);
    return;
  }
  if (!fs.existsSync(dir)) {
    console.error(`Error: No se encontró la carpeta: ${folderPath}`);
    return;
  }

  // Crear el video
  ffmpeg()
    .input(imagePattern) // Usar las imágenes
    .inputOptions(`-framerate ${framerate}`) // Configurar la duración de las imágenes (1 frame cada X segundos)
    .input(audioFile) // Añadir el audio
    .outputOptions('-c:v libx264') // Códec de video
    .outputOptions('-r 25') // Framerate del video final (25 FPS estándar)
    .outputOptions('-pix_fmt yuv420p') // Formato de píxel para compatibilidad
    .outputOptions('-shortest') // Ajustar duración del video al más corto (audio o imágenes)
    .output(outputVideo) // Ruta del archivo de salida
    .on('start', (commandLine) => {
      console.log('Comando ejecutado:', commandLine);
    })
    .on('progress', (progress) => {
      console.log('Progreso:', progress.percent + '%');
    })
    .on('end', () => {
      console.log('Video creado con éxito:', outputVideo);
    })
    .on('error', (err) => {
      console.error('Error al crear el video:', err.message);
    })
    .run();
}
