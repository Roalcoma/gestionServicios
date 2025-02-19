import express from 'express';
import cors from 'cors'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { routerLogin } from './routes/auth.js';
import { allRoutes } from './routes/allRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

const PORT = process.env.PORT ?? 9003

app.use(cors());

app.use(express.json())

//Utilizacion de la carpeta public
app.use(express.static(__dirname + '/public'))

const server= app.listen(PORT, () => {
  console.log(`Server on listening on port http://localhost:${PORT}`)
})

// Habilitar SO_REUSEADDR
server.on('connection', (socket) => {
  socket.setKeepAlive(true);
});

//Rutas Vistas
app.get('/', (req, res) => res.sendFile(__dirname + '/pages/login.html'))
app.get('/menu', (req, res) => res.sendFile(__dirname + '/pages/menu.html'))
app.get('/clientes', (req, res) => res.sendFile(__dirname + '/pages/listaClientes.html'))

app.use('/auth', routerLogin)
app.use('/api/allRoutes', allRoutes)


