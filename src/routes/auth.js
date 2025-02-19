import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../database/conectionPostgreSQL.js';

export const routerLogin = express.Router();

// Ruta de login
routerLogin.post('/login', async (req, res) => {
  const { username, contrasena } = req.body;

  if (!username || !contrasena) {
    return res.status(400).json({ error: 'Username y contraseña son requeridos' });
  }

  try {
    // Verificar si el usuario existe
    const query = 'SELECT * FROM USUARIOS WHERE UPPER(NOMBRE_USUARIO) = UPPER($1)';
    const values = [username];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.status(200).json({ mensaje: 'Login exitoso', usuario: { id: usuario.id_usuario, nombre: usuario.nombre_usuario, rol: usuario.rol } });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
