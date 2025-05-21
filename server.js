const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Configuración actualizada 2024
const REE_API_KEY = process.env.REE_API_KEY;
const CACHE_TIME = 300000; // 5 minutos

// Indicadores actualizados (IDs válidos 2024)
const INDICADORES = {
  demanda: 600,           // Demanda en tiempo real
  eolica: 1749,          // Generación eólica
  solar_fv: 1739,        // Generación solar fotovoltaica
  hidraulica: 1742,       // Generación hidráulica
  nuclear: 1745,          // Generación nuclear
  ciclo_combinado: 1743,  // Generación ciclo combinado
  precio: 1001,           // Precio mercado spot
  renovables: 551         // Otras renovables
};

let cache = {
  data: null,
  timestamp: null
};

// Función para calcular porcentaje libre de CO₂
const calcularCO2Free = (datos) => {
  const total = datos.demanda || 1;
  const limpio = (datos.eolica || 0) + (datos.solar_fv || 0) + (datos.hidraulica || 0) + (datos.renovables || 0);
  return ((limpio / total) * 100).toFixed(2);
};

// Middleware de caché
app.use('/datos-ree', (req, res, next) => {
  if (cache.data && (Date.now() - cache.timestamp < CACHE_TIME)) {
    return res.json(cache.data);
  }
  next();
});

app.get('/datos-ree', async (req, res) => {
  try {
    const datos = {};
    const now = new Date().toISOString();

    await Promise.all(Object.entries(INDICADORES).map(async ([key, id]) => {
      try {
        const response = await axios.get(`https://api.esios.ree.es/indicators/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${REE_API_KEY}`,
            'x-api-key': REE_API_KEY
          }
        });

        const valores = response.data?.indicator?.values;
        
        if (valores?.length > 0) {
          // Buscar el último valor no nulo
          const ultimoValor = valores.find(v => v.value !== null && v.geo_id === 3);
          datos[key] = ultimoValor?.value || null;
        } else {
          datos[key] = null;
        }

      } catch (error) {
        console.error(`❌ Error en ${key.toUpperCase()} (ID: ${id}): ${error.response?.status || error.message}`);
        datos[key] = null;
      }
    }));

    // Procesamiento adicional
    datos.timestamp = new Date().toISOString();
    datos.co2Free = calcularCO2Free(datos);
    
    // Actualizar caché
    cache = {
      data: datos,
      timestamp: Date.now()
    };

    res.json(datos);

  } catch (error) {
    console.error('❌ Error general:', error.message);
    res.status(500).json({
      error: 'Error al obtener datos',
      detalles: error.message,
      indicadores: INDICADORES
    });
  }
});

// Endpoint de estado
app.get('/status', (req, res) => {
  res.json({
    status: 'operativo',
    ultima_actualizacion: cache.timestamp ? new Date(cache.timestamp).toISOString() : 'Nunca',
    indicadores: INDICADORES,
    version: '2.1'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor funcionando en puerto ${PORT}`);
  console.log('Indicadores configurados:', INDICADORES);
});