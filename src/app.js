import express from "express";
import indexRoutes from "../src/routes/index.routes.js"
import usuariosRoutes from "../src/routes/usuarios.routes.js"
import bodyParser from "body-parser";
import accessRoutes from "../src/routes/access.routes.js"
import passport from "passport";
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import authRoutes  from '../src/routes/auth.routes.js';

const MySQLStore = MySQLStoreFactory(session);

const app = express()

// Configuración de la sesión
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: new MySQLStore({
        host: 'localhost',
        port: 3306,
        user: 'root',
        database: 'cookie_user'
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Configuración de Passport
app.use(passport.initialize());
app.use(passport.session());

// Parseo del cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de las vistas
app.set('view engine', 'ejs');



app.use(authRoutes)
// app.use('/', userRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



app.use(express.json())
app.use(usuariosRoutes)
app.use(indexRoutes)
// app.use(accessRoutes)
app.use((req, res, next)=>{
res.status(404).send({message: 'No se encontró la ruta'})
})

export default app