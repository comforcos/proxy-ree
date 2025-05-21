const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Clave API desde variables de entorno
const REE_API_KEY = process.env.REE_API_KEY;

// Indicadores ESIOS
const INDICADORES = {
  demanda: 1001,
  eolica: 600,
  solar_fv: 1739,
  hidraulica: 612,
  nuclear: 613,
  carbon: 614,
  ciclo_combinado: 617,
  otros: 618
};

// Endpoint principal
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

      const valores = response.data?.indicator?.values;
      if (valores && valores.length > 0) {
        datos[key] = valores[0].value;
      } else {
        console.warn(`⚠️ No hay datos para el indicador ${key} (ID: ${id})`);
        datos[key] = null;
      }
    }));

    res.json(datos);
  } catch (error) {
    console.error('❌ Error general al obtener datos de REE:', error.message);
    res.status(500).json({ error: 'Error al obtener datos de REE' });
  }
});

// Arranque del servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor funcionando en puerto ${PORT}`);
});
