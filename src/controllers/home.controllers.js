import { pool } from "../db.js";

export const getHomeSlide = async (req, res) => {
    try {
        const language = req.params.language || 'es'
        // Consulta para obtener los bloques de configuración necesarios
        const [slidesData] = await pool.query("SELECT name, value FROM configuration_blocks WHERE name IN ('slides', CONCAT('slides_desktop_', ?))", [language]);

        // Organizar los datos en un objeto utilizando 'name' como clave
        const slidesDataMap = slidesData.reduce((acc, cur) => {
            acc[cur.name] = cur;
            return acc;
        }, {});

        // Obtener los slides y slidesBd
        const slidesAll = JSON.parse(slidesDataMap['slides'].value);
        const slidesBd = JSON.parse(slidesDataMap[`slides_desktop_${language}`].value).reduce((acc, cur) => {
            acc[cur.pos] = cur.id;
            return acc;
        }, {});

        // Seleccionar los slides que están presentes en slidesBd
        const selectedSlides = slidesAll.filter(slide => Object.values(slidesBd).includes(slide.id));

        // Enviar los slides seleccionados como respuesta
        res.json(selectedSlides);
    } catch (error) {
        console.error('Failed to get home slide:', error);
        return res.status(500).json({ error: 'Failed to get home slide' });
    }
}
