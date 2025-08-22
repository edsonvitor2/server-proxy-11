import express from 'express';
import fetch from 'node-fetch';

const app = express();
const INTERNAL_SERVER = "http://192.168.20.171:3020";

app.use(express.json());

app.all('/api/*', async (req, res) => {
  try {
    const url = `${INTERNAL_SERVER}${req.path.replace('/api', '')}`;
    const options = {
      method: req.method,
      headers: { ...req.headers, host: undefined }, // tira host original
      body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
    };

    const response = await fetch(url, options);
    const data = await response.text();
    res.status(response.status).send(data);

  } catch (err) {
    console.error("Erro no proxy:", err);
    res.status(500).json({ error: "Erro ao redirecionar para o servidor interno" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy rodando na porta ${PORT}`));
