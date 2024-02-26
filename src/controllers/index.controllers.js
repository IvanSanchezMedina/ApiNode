import { pool } from "../db.js";

export const getUsuario =  async (req, res) => {
    const result=  await pool.query('SELECT * from views where id=30000')
    res.send(result[0])
}