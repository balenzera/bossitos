const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 10000; // Render usa el puerto 10000 por defecto

app.use(express.json());

// Middleware para servir el archivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configuración de la base de datos (asegúrate de que esta URL esté en tus variables de entorno de Render)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Endpoint para obtener los timers de todos los bosses
app.get('/api/timers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM timers');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los timers');
    }
});

// Endpoint para marcar la muerte de un boss
app.post('/api/boss/kill', async (req, res) => {
    const { name, duration } = req.body;
    try {
        const now = new Date();
        await pool.query(
            'INSERT INTO timers (boss_name, last_killed, respawn_duration) VALUES ($1, $2, $3) ON CONFLICT (boss_name) DO UPDATE SET last_killed = EXCLUDED.last_killed',
            [name, now, duration]
        );
        res.status(200).send('Timer actualizado correctamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar el timer');
    }
});

// Lanza el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

