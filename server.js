const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de REE
const REE_API_KEY = 'd504d53b4583c1ccaaaaa6a2b69ce649d7e897d374b4acb2445c87a34997c051';

// Indicadores actualizados
const INDICADORES = {
  demanda: 1001,
  eolica: 600,
  solar_fv: 1739, // ID verificado
  hidraulica: 612,
  nuclear: 613,
  carbon: 614,
  ciclo_combinado: 617,
  otros: 618
};

app.get('/datos-ree', async (req, res) => {
  try {
    const datos = {};
    
    await Promise.all(Object.entries(INDICADORES).map(async ([key, id]) => {
      const response = await axios.get(`https://api.esios.ree.es/indicators/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${REE_API_KEY}`,
          'x-api-key': REE_API_KEY
        }
      });
      datos[key] = response.data.indicator.values[0].value;
    }));

    res.json(datos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// ¡SOLO UN app.listen!
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor funcionando en puerto ${PORT}`);
});