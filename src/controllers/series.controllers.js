import { pool } from '../db.js';

export const getSeries = async(req, res) => {
    try{

        const [rows] = await pool.query(`
            SELECT series.*, users.first_name, users.last_name
            FROM series
            INNER JOIN users ON series.user_id = users.id
            WHERE series.status != 'Deleted'
            ORDER BY series.id DESC;
        `);

        const array = {
            status : 'success',
            message: "List for series",
            items : rows
        }

        res.json(array);
    } catch(error){
        return res.status(500).json({
            message:'No se puede consultar la serie'
        })
    }
}

export const getSerie = async (req,res)=> {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.query('Select * from series where id=?',[id]);

        if (rows.length <= 0) return res.json({message: "La serie no existe"});

        res.json(rows[0])
    } catch (error) {
        return res.status(500).json({
            message: "Existio un error"
        })
    }
}