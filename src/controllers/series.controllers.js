import { pool } from '../db.js';

export const getSeries = async(req, res) => {
    try{

        const [rows] = await pool.query('Select  * From series order by id asc limit 3');

        res.json(rows);
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

        res.json(rows)
    } catch (error) {
        return res.status(500).json({
            message: "Existio un error"
        })
    }
}