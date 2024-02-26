import { pool } from "../db.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por email
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = rows[0];

         // Verificar la contraseña utilizando SHA-512
         const hashedPassword = crypto.createHash('sha512').update(password).digest('base64');
         if (hashedPassword !== user.password) {
             return res.status(401).json({ message: 'Credenciales inválidas' });
         }

        // Si las credenciales son válidas, enviar la información del usuario
        res.status(200).json({
            id: user.id,
            email: user.email,
            nombre: user.first_name, // Ajusta según tu esquema de base de datos
            apellido: user.last_name, // Ajusta según tu esquema de base de datos
            tipo: user.type // Ajusta según tu esquema de base de datos
            // Puedes incluir más información del usuario si es necesario
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ 
            // message: 'Error interno del servidor' 
            message: error.message
        });
    }
};