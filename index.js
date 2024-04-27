const express = require('express');
const dotenv = require('dotenv');
const { Client } = require('pg');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '192.168.1.29';

const connectionString = process.env.POSTGRES_URL;

const client = new Client({
  connectionString: connectionString,
});

// Conectar el cliente de PostgreSQL
client.connect()
  .then(() => {
    console.log('Conexión exitosa a PostgreSQL');
  })
  .catch(err => {
    console.error('Error al conectar a PostgreSQL:', err);
    process.exit(1); // Salir con código de error
  });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/public/"));

app.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM ip_blocked');
    const ipBlocked = result.rows;
    res.render('blocked', { ipBlocked });
  } catch (err) {
    console.error('Error al obtener las IP bloqueadas:', err);
    res.status(500).send('Error interno del servidor');
  }
});

app.post('/delete-ip', async (req, res) => {
  const ipId = req.body.ip_id;
  try {
    await client.query('DELETE FROM ip_blocked WHERE id = $1', [ipId]);
    res.redirect('/');
  } catch (err) {
    console.error('Error al eliminar la IP bloqueada:', err);
    res.status(500).send('Error interno del servidor');
  }
});
//agrgar ip desde el form de la pagina manual
app.post('/add-ip', async (req, res) => {
  const { ip, reason } = req.body;
  try {
    await client.query('INSERT INTO ip_blocked (ip_address, reason) VALUES ($1, $2)', [ip, reason]);
    res.redirect('/');
  } catch (err) {
    console.error('Error al agregar la IP bloqueada:', err);
    res.status(500).send('Error interno del servidor');
  }
});

//agrgar ip desde link
app.get('/add-ip-link/:ip/:reason', async (req, res) => {
  const { ip, reason } = req.params;
  try {
    // Aquí puedes usar ip y reason para agregar a la base de datos
    await client.query('INSERT INTO ip_blocked (ip_address, reason) VALUES ($1, $2)', [ip, reason]);
    res.redirect('/');
  } catch (err) {
    console.error('Error al agregar la IP bloqueada:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para consultar si una IP existe en la base de datos
app.get('/check-ip/:ipAddress', async (req, res) => {
  const ipAddress = req.params.ipAddress;
  try {
    const result = await client.query('SELECT COUNT(*) FROM ip_blocked WHERE ip_address = $1', [ipAddress]);
    const ipCount = parseInt(result.rows[0].count, 10);
    const exists = ipCount > 0;
    res.json({ exists });
  } catch (err) {
    console.error('Error al consultar la IP en la base de datos:', err);
    res.status(500).send('Error interno del servidor');
  }
});



// Middleware de error para manejar errores no capturados
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Iniciar el servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
