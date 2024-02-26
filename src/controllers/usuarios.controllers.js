import { error } from "console";
import { pool } from "../db.js";
import crypto from 'crypto';

function validPassword(password,hash,salt)
{
    var hashVerify=crypto.pbkdf2Sync(password,salt,10000,60,'sha512').toString('hex');
    return hash === hashVerify;
}

function genPassword(password)
{
    var salt=crypto.randomBytes(32).toString('hex');
    var genhash=crypto.pbkdf2Sync(password,salt,10000,60,'sha512').toString('hex');
    return {salt:salt,hash:genhash};
}

export const getUsuarios = async(req, res) => {
    try{ 

        // throw new Error ('My Error')
        const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC LIMIT 300 ')

        res.json(rows)

    }catch(error){
        return res.status(500).json({
            message:"Algo salio mal"
        })
    }
    


}

export const getUsuario = async(req, res) => {
    const { id } = req.params;

    try {
            // throw new Error ('My Error')
        const [rows] = await pool.query('SELECT * FROM users WHERE id=? ',[id])
   
    if (rows.length <= 0) return res.status(404).json({
        message:"Usuario no encontrado"
    }) 
    res.json(rows)
    } catch (error) {
        return res.status(500).json({
            message:"Algo salio mal"
        })
    }
    
   }
   

  
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
  
  export const createUsuario = async(req, res)=>{
      console.log(req.body)
  
      const {first_name,last_name,email,username, password, source,type} = req.body
    
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
            message:"Algo salio mal al verificar el usuario"
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
        const [rows]= await pool.query('INSERT INTO users(first_name,last_name,email,username,password,source,type, created_at) VALUES(?,?,?,?,?,?,?, NOW())',
        [first_name,last_name,email,username, hashedPassword, source,type])
    
        res.send({
          id:rows.insertId,
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
                message:"Algo salio mal al guardar el usuario"
            })
        }
    
     
  }
  
  export const putUsuarios = async (req, res) => {
      const { id } = req.params;
      const { first_name, last_name, email, username, password, source, type } = req.body;
  
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
            message:"Algo salio mal al guardar el usuario"
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
            const [result] = await pool.query('UPDATE users SET first_name=IFNULL(?,first_name), last_name=IFNULL(?,last_name), email=IFNULL(?,email), username=IFNULL(?,username), password=IFNULL(?,password), source=IFNULL(?,source), type=IFNULL(?,type), updated_at=NOW() WHERE id=?',
            [first_name, last_name, email, username, hashedPassword, source, type, id]);
            
            if (result.affectedRows <= 0) return res.status(404).json({
                message:"Usuario no encontrado"
            }) 
    
            res.send({ result });
            
        } catch (error) {
            return res.status(500).json({
                message:"Algo salio mal al guardar el usuario"
            })
        }
        
       
      } else {

        try {
            const [result] = await pool.query('UPDATE users SET first_name=IFNULL(?,first_name), last_name=IFNULL(?,last_name), email=IFNULL(?,email), username=IFNULL(?,username), source=IFNULL(?,source), type=IFNULL(?,type), updated_at=NOW() WHERE id=?',
            [first_name, last_name, email, username, source, type, id]);
      
            if (result.affectedRows <= 0) return res.status(404).json({
                message:"Usuario no encontrado"
            }) 
    
            res.send({ result });
        } catch (error) {
            return res.status(500).json({
                message:"Algo salio mal al guardar el usuario"
            })
        }
       
      }
  }
  
  export const deleteUsuarios = async(req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('DELETE FROM users WHERE id=? ',[id])
   
    if (rows.affectedRows <= 0) return res.status(404).json({
        message:"Usuario no encontrado"
    }) 
    res.sendStatus(204)
    } catch (error) {
        return res.status(500).json({
            message:"Algo salio mal al guardar el usuario"
        })
    }
    
   }
   
  
