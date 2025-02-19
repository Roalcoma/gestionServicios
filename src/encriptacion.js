import bcrypt from 'bcrypt';

const saltRounds = 10;

// Encriptar una contraseña
const encriptarContrasena = async (password) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log(hashedPassword)
  return hashedPassword;
};

// Comparar contraseñas
const verificarContrasena = async (password, hashedPassword) => {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
};


