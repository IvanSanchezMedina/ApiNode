import { pool } from '../db.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import userSession from '../controllers/sessions.controller.js';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por email
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      
        if (rows.length === 0) {
            return res.status(401).json({ message: 'No se encuentra usuario con ese correo' });
        }

        const user = rows[0];

        // Verificar la contraseña utilizando SHA-512
        const hashedPassword = crypto.createHash('sha512').update(password).digest('base64');
        if (hashedPassword !== user.password) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        

        // Generar el token JWT
        const token = jwt.sign({ email: user.email, id: user.id }, 'tu_secreto_jwt', { expiresIn: '1h' });

        const data = {
            token: token,
            id: user.id,
            email: user.email,
            nombre: user.first_name,
            apellido: user.last_name,
            tipo: user.type
        }
        // Si las credenciales son válidas, enviar la información del usuario con el token
        res.status(200).json(data);

         // Guardar los datos del usuario en la sesión
        req.session.user = data

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({
            message: error.message
        });
    }
};

export const loginWithSession = [userSession, login];

// Crear una lista negra de tokens
const blacklistedTokens = new Set();

// Agregar middleware para verificar si el token está en la lista negra
export const blacklistMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del encabezado de autorización

    if (token && blacklistedTokens.has(token)) {
        return res.status(401).json({ message: 'Token inválido' });
    }

    next();
};

// Función de logout para agregar tokens a la lista negra
export const logout = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del encabezado de autorización
        
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        
        // Si la sesión se ha eliminado correctamente, enviar una respuesta exitosa
        // return res.status(200).json({ message: 'Logout exitoso' });
    });

    if (token) {
        blacklistedTokens.add(token);
        return res.status(200).json({ message: 'Logout exitoso' });
    } else {
        return res.status(400).json({ message: 'Token no proporcionado' });
    }
};

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del encabezado de autorización

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, 'tu_secreto_jwt', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        req.user = decoded; // Agregar el usuario decodificado al objeto de solicitud
        next();
    });
};