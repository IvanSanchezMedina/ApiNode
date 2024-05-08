import { pool } from "../db.js";

export const getCountries = async(req, res)=>{
    try {
        const [result] = await pool.query("SELECT * FROM countries ORDER BY id ASC");
        res.json(result);
        
         }
         catch(error){
            return res.status(500).json({ error: 'Failed to get Countries' });
         }
}