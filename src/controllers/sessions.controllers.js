import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { pool } from '../db.js';
const MySQLStore = MySQLStoreFactory(session);

const options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '', // Agrega tu contraseña aquí si tienes una
    database: 'akaya_new',
    createDatabaseTable: true, // Esto creará la tabla de sesión automáticamente si no existe
    schema: {
        tableName: 'sessions' // Puedes personalizar el nombre de la tabla de sesiones si lo deseas
    },
    expiration: 86400000, // Tiempo de expiración de las sesiones (en milisegundos)
    clearExpired: true, // Eliminar sesiones expiradas automáticamente
    checkExpirationInterval: 900000, // Intervalo de comprobación de expiración (en milisegundos)
    connectionLimit: 1, // Limita el número de conexiones simultáneas al almacenamiento de sesiones
    endConnectionOnClose: true, // Cierra la conexión cuando la tienda de sesiones se cierra
    charset: 'utf8mb4_bin', // Codificación de caracteres para la tabla de sesiones
    ...pool // Pasar tu pool de conexiones existente aquí
};


const sessionStore = new MySQLStore(options);

const userSession = session({
    key: 'cookie_usuario',
    secret:'123123123',
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
});

export default userSession;

