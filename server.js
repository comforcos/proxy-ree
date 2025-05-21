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
        console.warn(`⚠️ No hay datos para el indicador ${key} (id: ${id})`);
        datos[key] = null;
      }
    }));

    res.json(datos);
  } catch (error) {
    console.error('❌ Error general al obtener datos de REE:', error.message);
    res.status(500).json({ error: 'Error al obtener datos de REE' });
  }
});
