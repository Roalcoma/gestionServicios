import pkg from 'pg';

const {Pool} = pkg

export const pool = new Pool({
  user: 'rodrigo_user',
  host: 'localhost',
  database: 'organizador_clientes',
  password: 'R3d3s1pc4..',
  port: 5432,
});

