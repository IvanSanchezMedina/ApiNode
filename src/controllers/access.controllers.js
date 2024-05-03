import { pool } from '../db.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import userSession from './sessions.controllers.js';
import { error } from 'console';

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
        const token = jwt.sign({
            email: user.email,
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            type: user.type,
            username: user.username,
            source: user.source,
            type: user.type,
            avatar: user.avatar,
            tagline: user.tagline,
            web:user.web,
            bio:user.bio,
            facebook:user.facebook,
            twitter: user.twitter,
            instagram: user.instagram,
            birthday: user.birthday,
            location: user.location,
            fav_serie_1: user.fav_serie_1,
            fav_serie_2: user.fav_serie_2,
            fav_serie_3: user.fav_serie_3,
            adult_content:user.adult_content,
            akaya_coins: user.akaya_coins,
            bonus_coins:user.bonus_coins,
            header_img:user.header_img
        }, 'tu_secreto_jwt', { expiresIn: '1h' });

        const data = {
            token: token,
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            type: user.type,
            username: user.username,
            source: user.source,
            type: user.type,
            avatar: user.avatar,
            tagline: user.tagline,
            web:user.web,
            bio:user.bio,
            facebook:user.facebook,
            twitter: user.twitter,
            instagram: user.instagram,
            birthday: user.birthday,
            location: user.location,
            fav_serie_1: user.fav_serie_1,
            fav_serie_2: user.fav_serie_2,
            fav_serie_3: user.fav_serie_3,
            adult_content:user.adult_content,
            akaya_coins: user.akaya_coins,
            bonus_coins:user.bonus_coins,
            header_img:user.header_img
        }

        res.cookie("token", token)
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
    // const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del encabezado de autorización
    const token = req.headers.cookie.split('token=')[1].split(';')[0].trim();
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
    });

    if (token) {
        blacklistedTokens.add(token);
        return res.status(200).json({ message: 'Logout exitoso' });
    } else {
        return res.status(400).json({ message: 'Token no proporcionado' });
    }
};

export const verifyTokenRequest = (req, res, next) => {
    // const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del encabezado de autorización
    const token = req.headers.cookie.split('token=')[1].split(';')[0].trim();


    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, 'tu_secreto_jwt', async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        req.user = decoded; // Agregar el usuario decodificado al objeto de solicitud

        return res.json(decoded);
    });
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


function isValidString(str) {
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(str) && str.trim() !== '';
}

function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isValidPassword(password) {
    return password.length >= 6;
}

function isValidSource(source) {
    return source === 'local' || source === 'web';
}

function isValidType(type) {
    return type === 'admin' || type === 'author' || type === 'user';
}

export const register = async (req, res) => {

    const { first_name, last_name, email, username, password, source, type } = req.body
    const errors = [];

    // if (!isValidString(first_name)) {
    //   return res.status(400).send({ error: 'First name is not a valid string' });
    // }
    // if (!isValidString(last_name)) {
    //   return res.status(400).send({ error: 'Last name is not a valid string' });
    // }

    if (!isValidEmail(email)) {
        // return res.status(400).send({ message: ['Email is not a valid email'] });
        errors.push('Email is not a valid email');
    }

    try {

        // throw new Error ('My Error')
        const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length > 0) {
            errors.push('Email already exists');
            // return res.status(400).send({ message: 'Email already exists' });
        }
    } catch (error) {
        return res.status(500).json(["Algo salio mal al verificar el usuario"])
    }


    if (!isValidString(username)) {
        errors.push('Username is not a valid string');
    }

    if (!isValidPassword(password)) {
        errors.push('Password must be at least 6 characters long');
    }

    if (!isValidSource(source)) {
        errors.push('Source must be either "local" or "web"');
    }

    if (!isValidType(type)) {
        errors.push('Type must be either "admin", "author" or "user"');
    }

    if (errors.length > 0) {
        return res.status(400).json(errors);
    }


    // Hash the password using SHA-512
    const hashedPassword = crypto.createHash('sha512').update(password).digest('base64');

    try {

        //   throw new Error ('My Error')
        const [rows] = await pool.query('INSERT INTO users(first_name,last_name,email,username,password,source,type, created_at) VALUES(?,?,?,?,?,?,?, NOW())',
            [first_name, last_name, email, username, hashedPassword, source, type])

    
        const token = jwt.sign({
            email: email,
            id: rows.insertId,
            first_name,
            last_name,
            type,
            username,
            source,
            type,
            avatar
          
        }, 'tu_secreto_jwt', { expiresIn: '1h' });

        const data = {
            token: token,
            id: rows.insertId,
            first_name,
            last_name,
            type,
            username,
            source,
            type
        }
        // Generar el token JWT

        res.cookie("token", token)
        // Si las credenciales son válidas, enviar la información del usuario con el token
        res.status(200).json(data);

        // Guardar los datos del usuario en la sesión
        req.session.user = data

    } catch (error) {
        return res.status(500).json(["Algo salio mal al guardar el usuario, lo resolveremos pronto"])
    }


}