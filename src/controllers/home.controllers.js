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


export const getHomeBlocks = async (req, res) => {
    try {
        const language = req.params.language || 'es'
        // Consulta para obtener los bloques de configuración necesarios
        const [blocksData] = await pool.query("SELECT value FROM configuration_blocks WHERE name IN ('blocks', CONCAT('desktop_', ?))", [language]);

        const allBlocks = JSON.parse(blocksData[0].value).reduce((acc, cur) => {
            acc[cur.id] = cur;
            return acc;
        }, {});
        // const allBlocks  = JSON.parse(blocksData[0].value).map(block =>
        //      block.id
        //      );
        const blocksIDs = JSON.parse(blocksData[1].value).map(block => block.id);

        // Crear un objeto donde las claves son los ids de los bloques y los valores son los bloques en sí
        const blocksDataMap = JSON.parse(blocksData[0].value).reduce((acc, block) => {
            acc[block.id] = block;
            return acc;
        }, {});



        const blocks = [];

        for (const blockID of blocksIDs) {
            const blockData = blocksDataMap[blockID];
            if (blockData) {
                let block = {
                    name: blockData.name,
                    type: blockData.type,
                    id: blockData.id,
                };

                if (isContentBlock(blockData.type)) {
                    try {
                        block.series = await getBlockContent(blockData);
                        
                    } catch (error) {
                        console.error('Error fetching block content:', error);
                        block.series = [];
                    }
                } else {
                    block = getBlockBanner(blockData, block);
                }

                blocks.push(block);
            }
        }

        res.json(blocks);

    } catch (error) {


        console.error('Failed to get home blocks:', error);
        return res.status(500).json({ error: 'Failed to get home blocks' });
    }
}

function isContentBlock(type) {
    return (type != '4' && type != '5');
}

async function getBlockContent(block) {
    const typeHandlers = {
        '1': getSeriesByGenre,
        '2': getSeriesByTags,
        '3': getSeriesByGroup,
        '6': getSeriesByGroupSchedule
    };

    if (typeHandlers.hasOwnProperty(block.type)) {
        const handler = typeHandlers[block.type];
        try {
            const result = await handler(block);

            return result;
        } catch (error) {
            console.error('Error in handler:', error);
            return [];
        }
    } else {
        return [];
    }
}

async function getSeriesByGroup(block) {
    const order = getBlockContentOrder(block.order);

    const reversedSeries = block.series.slice().reverse();

    const [seriesData] = await pool.query("SELECT id,name,image FROM series WHERE id IN (?) AND status != 'Deleted' ORDER BY FIELD(id, ?)", [reversedSeries, reversedSeries]);

    return seriesData;
}

async function getSeriesByGroupSchedule(block) {
    const reversedSeries = block.series.slice().reverse();

    let series = [];

    if (reversedSeries.length > 0) {
        const [seriesData] = await pool.query("SELECT id,name,image FROM series WHERE id IN (?) AND status != 'Deleted' ORDER BY FIELD(id, ?)", [reversedSeries, reversedSeries]);

        series = seriesData;

    }

    return series;
}

async function getSeriesByTags(block) {
    const tags = block.tags;

    let series = [];

    if (tags.length > 0) {
        let seriesInTags = [];

        for (const tag of tags) {
            try {
                const tagSeries = await pool.query("SELECT serie_id FROM series_tags WHERE tag_id = ?", [tag]);

                if (!tagSeries || tagSeries.length === 0) {
                    continue;
                }
                // Obtenemos los IDs de las series de cada tag (son arreglos de arreglos)
                const serieIds = tagSeries.flatMap(series => series.map(item => item.serie_id));
                seriesInTags = [...new Set([...seriesInTags, ...serieIds])];
            } catch (error) {
                console.error("Error fetching tag series:", error);
            }
        }

        if (seriesInTags.length > 0) {

            const [seriesData] = await pool.query("SELECT id, name, image FROM series WHERE id IN (?) AND status = 'Published'", [seriesInTags]);

            series = seriesData;
        }
    }

    return series;
}


function getBlockBanner(blockContent, block) {
    switch (blockContent.type) {
        case '4':
            block.img1 = blockContent.img1;
            block.url1 = blockContent.url1;
            return block;
        case '5':
            block.img1 = blockContent.img1;
            block.url1 = blockContent.url1;
            block.img2 = blockContent.img2;
            block.url2 = blockContent.url2;
            return block;
        default:
            return block;
    }
}

async function getSeriesByGenre(block) {
    const order = getBlockContentOrder(block.order);

    let query = Serie.find({
        genre_id: parseInt(block.genre),
        status: { $ne: 'Deleted' }
    });

    const langContent = 'both'; // Assuming you handle the language in a similar way in Node.js
    if (langContent !== 'both') {
        query = query.where('language_id').equals(langContent);
    }

    const series = await query
        .sort([[order[0], order[1]]])
        .limit(parseInt(block.quantity))
        .select('id name image')
        .exec();

    return series;
}



function getBlockContentOrder(order) {
    switch (order) {
        case '1':
            return ['created_at', 'desc'];
        case '2':
        case '3':
            return ['name', 'asc'];
        case '4':
            return ['updated_at', 'desc'];
        case '5':
            return ['_id', 'desc']; // Just for registration
        default:
            return ['name', 'asc'];
    }
}
