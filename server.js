// server.js
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const REE_API_KEY = 'd504d53b4583c1ccaaaaa6a2b69ce649d7e897d374b4acb2445c87a34997c051';

// Indicadores actualizados REE 2024
const INDICADORES = {
  demanda: 1001,        // Demanda eléctrica nacional
  eolica: 600,         // Generación eólica
  solar_fv: 10195,     // Solar fotovoltaica (CORREGIDO)
  hidraulica: 612,     // Hidráulica
  nuclear: 613,        // Nuclear
  carbon: 614,         // Carbón
  ciclo_combinado: 617,// Ciclo combinado (gas)
  otros: 618           // Otras tecnologías
};

app.get('/datos-ree', async (req, res) => {
  try {
    const datos = {};
    
    // Obtener todos los datos en paralelo
    await Promise.all(Object.entries(INDICADORES).map(async ([key, id]) => {
      const response = await axios.get(`https://api.esios.ree.es/indicators/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${REE_API_KEY}`,
          'x-api-key': REE_API_KEY
        }
      });
      datos[key] = response.data.indicator.values[0]?.value || 0;
    }));

    res.json(datos);
  } catch (error) {
    console.error('Error en proxy:', error);
    res.status(500).json({ error: 'Error al obtener datos de REE' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
