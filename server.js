// server.js (versión corregida)
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const REE_API_KEY = 'd504d53b4583c1ccaaaaa6a2b69ce649d7e897d374b4acb2445c87a34997c051';

// INDICADORES CORRECTOS (actualizados 2024)
const INDICADORES = {
  demanda: 1001,       // Demanda PENINSULAR en MW
  eolica: 600,        // Eólica
  solar_fv: 10195,    // Solar Fotovoltaica
  hidraulica: 612,    // Hidráulica
  nuclear: 613,       // Nuclear
  carbon: 614,        // Carbón
  ciclo_combinado: 617, // Ciclo Combinado (Gas)
  otros: 618          // Otras renovables
};

app.get('/datos-ree', async (req, res) => {
  try {
    const datos = {};
    
    // Obtener datos en paralelo
    await Promise.all(Object.entries(INDICADORES).map(async ([key, id]) => {
      const response = await axios.get(`https://api.esios.ree.es/indicators/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${REE_API_KEY}`,
          'x-api-key': REE_API_KEY
        }
      });
      
      // Extraer valor correcto (MW)
      datos[key] = response.data.indicator.values[0].value;
    }));

    res.json(datos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Proxy activo en puerto ${PORT}`);
});