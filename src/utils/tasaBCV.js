import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import cron from 'node-cron'
import { pgconnection } from '../pgSQL.js';

const url = 'https://www.bcv.org.ve/';

// Crear un agente HTTPS que ignore errores de certificado
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function obtenerTasaDolar() {
    try {
        // Realiza la solicitud HTTP GET con el agente personalizado
        const { data } = await axios.get(url, { httpsAgent });

        // Carga el HTML en Cheerio
        const $ = cheerio.load(data);

        // Selecciona el elemento donde está la tasa del dólar
        const tasaDolar = $('.view-tipo-de-cambio-oficial-del-bcv #dolar strong').text().trim();

        let tasaDolarValida = parseFloat(tasaDolar.replace(',', '.'))

        console.log(`La tasa de cambio del dólar es: ${tasaDolarValida}`);
        
        let actualizarTasa = pgconnection.actualizarTasa(new Date(), tasaDolarValida)
        let vueltas = 0

        while (actualizarTasa === -1) {
          vueltas++
          actualizarTasa = pgconnection.actualizarTasa(new Date(), tasaDolarValida)
          console.log(`He dado ${vueltas} vueltas`) 
        }
    } catch (error) {
        console.error('Error al obtener la tasa de cambio:', error.message);
    }
}


//cron.schedule('0 3 * * *', obtenerTasaDolar());
// Ejecución de prueba

obtenerTasaDolar()



