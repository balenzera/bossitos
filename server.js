const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Sirve los archivos estáticos desde la carpeta 'public'
// Esto hará que Render muestre index.html por defecto
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la base de datos
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

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
