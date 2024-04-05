import express from "express";
import usuariosRoutes from "../src/routes/usuarios.routes.js"
import bodyParser from "body-parser";
import accessRoutes from "../src/routes/access.routes.js"
import userSession  from "./controllers/sessions.controllers.js"
import seriesRoutes from "../src/routes/series.routes.js"
import homeRoutes from "../src/routes/home.routes.js"
import cors from "cors"
const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}));
app.use(userSession)

app.get('/', (req,res)=>{
    req.session.usuario='Ivan';
    req.session.rol='Admin';
    req.session.visitas= req.session.visitas? ++req.session.visitas:1;
    res.send(`El usuario <strong>${req.session.usuario}</strong> con el rol <strong> ${req.session.rol} </strong> tiene un total de 
    <strong> ${req.session.visitas} </strong> visitas`)
})

// Parseo del cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke! JAJAJA');
});

app.use(express.json())
app.use(usuariosRoutes)
app.use(accessRoutes)
app.use(seriesRoutes)
app.use(homeRoutes)

app.use((req, res, next)=>{
res.status(404).send({message: 'No se encontró la ruta'})
})

export default app