import { pool } from "../db.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

function validPassword(password, hash, salt) {
  var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 60, 'sha512').toString('hex');
  return hash === hashVerify;
}

function genPassword(password) {
  var salt = crypto.randomBytes(32).toString('hex');
  var genhash = crypto.pbkdf2Sync(password, salt, 10000, 60, 'sha512').toString('hex');
  return { salt: salt, hash: genhash };
}

export const getUsuarios = async (req, res) => {
  try {

    // throw new Error ('My Error')
    const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC LIMIT 300 ')

    res.json(rows)

  } catch (error) {
    return res.status(500).json({
      message: "Algo salio mal"
    })
  }



}

export const getUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    // throw new Error ('My Error')
    const [rows] = await pool.query('SELECT * FROM users WHERE id=? ', [id])

    if (rows.length <= 0) return res.status(404).json({
      message: "Usuario no encontrado"
    })
    res.json(rows)
  } catch (error) {
    return res.status(500).json({
      message: "Algo salio mal"
    })
  }

}


function isValidString(str) {
  const regex = /^[a-zA-Z\u00C0-\u00FF\s]+$/; // Unicode range for Latin-1 Supplement (Á-ÿ)
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

export const createUsuario = async (req, res) => {

  const { first_name, last_name, email, username, password, source, type } = req.body

  if (!isValidString(first_name)) {
    return res.status(400).send({ error: 'First name is not a valid string' });
  }
  if (!isValidString(last_name)) {
    return res.status(400).send({ error: 'Last name is not a valid string' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).send({ error: 'Email is not a valid email' });
  }

  try {

    // throw new Error ('My Error')
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length > 0) {
      return res.status(400).send({ error: 'Email already exists' });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Algo salio mal al verificar el usuario"
    })
  }


  if (!isValidString(username)) {
    return res.status(400).send({ error: 'Username is not a valid string' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).send({ error: 'Password must be at least 6 characters long' });
  }

  if (!isValidSource(source)) {
    return res.status(400).send({ error: 'Source must be either "local" or "web"' });
  }

  if (!isValidType(type)) {
    return res.status(400).send({ error: 'Type must be either "admin", "author" or "user"' });
  }

  // Hash the password using SHA-512
  const hashedPassword = crypto.createHash('sha512').update(password).digest('base64');

  try {

    //   throw new Error ('My Error')
    const [rows] = await pool.query('INSERT INTO users(first_name,last_name,email,username,password,source,type, created_at) VALUES(?,?,?,?,?,?,?, NOW())',
      [first_name, last_name, email, username, hashedPassword, source, type])

    res.send({
      id: rows.insertId,
      first_name,
      last_name,
      username,
      email,
      password: hashedPassword,
      source,
      type
    })

  } catch (error) {
    return res.status(500).json({
      message: "Algo salio mal al guardar el usuario"
    })
  }


}

export const putUsuarios = async (req, res) => {

  const { id } = req.params;
  const { first_name, last_name, email, username, password, source, type, birthday, facebook, twitter, instagram, web, tagline, location, adult_content, profile_with_activity, bio } = req.body;
  console.log(req.body)

  if (first_name && !isValidString(first_name)) {
    return res.status(400).send({ error: 'First name is not a valid string' });
  }
  if (last_name && !isValidString(last_name)) {
    return res.status(400).send({ error: 'Last name is not a valid string' });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).send({ error: 'Email is not a valid email' });
  }

  try {
    const [user] = await pool.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, id]);
    if (user.length > 0) {
      return res.status(400).send({ error: 'Email already exists' });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Algo salio mal al guardar el usuario"
    })
  }



  if (username && !isValidString(username)) {
    return res.status(400).send({ error: 'Username is not a valid string' });
  }

  if (password && !isValidPassword(password)) {
    return res.status(400).send({ error: 'Password must be at least 6 characters long' });
  }

  if (source && !isValidSource(source)) {
    return res.status(400).send({ error: 'Source must be either "local" or "web"' });
  }

  if (type && !isValidType(type)) {
    return res.status(400).send({ error: 'Type must be either "admin", "author" or "user"' });
  }

  if (password) {

    try {

      const hashedPassword = crypto.createHash('sha512').update(password).digest('base64');
      const [result] = await pool.query('UPDATE users SET first_name=IFNULL(?,first_name), last_name=IFNULL(?,last_name), email=IFNULL(?,email), username=IFNULL(?,username), password=IFNULL(?,password), source=IFNULL(?,source), type=IFNULL(?,type),  updated_at=NOW(), birthday=IFNULL(?,birthday), facebook=IFNULL(?,facebook), twitter=IFNULL(?,twitter), instagram=IFNULL(?,instagram), web=IFNULL(?,web), tagline=IFNULL(?,tagline), location=IFNULL(?,location), bio=IFNULL(?,bio), adult_content=IFNULL(?,adult_content), profile_with_activity=IFNULL(?,profile_with_activity)  WHERE id=?',
        [first_name, last_name, email, username, hashedPassword, source, type, birthday, facebook, twitter, instagram, web, tagline, location, bio, adult_content, profile_with_activity, id]);

      if (result.affectedRows <= 0) return res.status(404).json({
        message: "Usuario no encontrado"
      })

      res.send({ result });

    } catch (error) {
      return res.status(500).json({
        message: "Algo salio mal al guardar el usuario"
      })
    }


  } else {

    try {
      const [result] = await pool.query('UPDATE users SET first_name=IFNULL(?,first_name), last_name=IFNULL(?,last_name), email=IFNULL(?,email), username=IFNULL(?,username), source=IFNULL(?,source), type=IFNULL(?,type), updated_at=NOW(),birthday=IFNULL(?,birthday), facebook=IFNULL(?,facebook), twitter=IFNULL(?,twitter), instagram=IFNULL(?,instagram), web=IFNULL(?,web), tagline=IFNULL(?,tagline), location=IFNULL(?,location), bio=IFNULL(?,bio), adult_content=IFNULL(?,adult_content),  profile_with_activity=IFNULL(?,profile_with_activity) WHERE id=?',
        [first_name, last_name, email, username, source, type, birthday, facebook, twitter, instagram, web, tagline, location, bio, adult_content, profile_with_activity, id]);

      if (result.affectedRows <= 0) return res.status(404).json({
        message: "Usuario no encontrado"
      })

      const [rows] = await pool.query('SELECT * FROM users WHERE id=? ', [id])

      if (rows.length <= 0) return res.status(404).json({
        message: "Usuario no encontrado"
      })

      const user = rows[0];

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
        web: user.web,
        bio: user.bio,
        facebook: user.facebook,
        twitter: user.twitter,
        instagram: user.instagram,
        birthday: user.birthday,
        location: user.location,
        fav_serie_1: user.fav_serie_1,
        fav_serie_2: user.fav_serie_2,
        fav_serie_3: user.fav_serie_3,
        adult_content: user.adult_content,
        akaya_coins: user.akaya_coins,
        bonus_coins: user.bonus_coins,
        header_img: user.header_img,
        avatar:user.avatar,
        profile_with_activity: user.profile_with_activity
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
        web: user.web,
        bio: user.bio,
        facebook: user.facebook,
        twitter: user.twitter,
        instagram: user.instagram,
        birthday: user.birthday,
        location: user.location,
        fav_serie_1: user.fav_serie_1,
        fav_serie_2: user.fav_serie_2,
        fav_serie_3: user.fav_serie_3,
        adult_content: user.adult_content,
        akaya_coins: user.akaya_coins,
        bonus_coins: user.bonus_coins,
        header_img: user.header_img,
        avatar:user.avatar,
        profile_with_activity: user.profile_with_activity
      }

      res.cookie("token", token)
      // Si las credenciales son válidas, enviar la información del usuario con el token
      res.status(200).json(data);

      // Guardar los datos del usuario en la sesión
      req.session.user = data

    } catch (error) {
      return res.status(500).json({
        message: "Algo salio mal al guardar el usuario"
      })
    }

  }
}

export const deleteUsuarios = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('DELETE FROM users WHERE id=? ', [id])

    if (rows.affectedRows <= 0) return res.status(404).json({
      message: "Usuario no encontrado"
    })
    res.sendStatus(204)
  } catch (error) {
    return res.status(500).json({
      message: "Algo salio mal al guardar el usuario"
    })
  }

}


