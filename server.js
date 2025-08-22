const express = require("express");
const fetch = require("node-fetch");

const app = express();
const INTERNAL_SERVER = "http://187.91.163.146:3040";

app.use(express.json());

// Middleware para interceptar tudo que começa com /api
app.use("/api", async (req, res) => {
  try {
    const url = `${INTERNAL_SERVER}${req.originalUrl.replace("/api", "")}`;
    const options = {
      method: req.method,
      headers: { ...req.headers, host: undefined },
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : JSON.stringify(req.body),
    };

    const response = await fetch(url, options);

    // Respeita JSON vs texto
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const json = await response.json();
      res.status(response.status).json(json);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (err) {
    console.error("Erro no proxy:", err);
    res
      .status(500)
      .json({ error: "Erro ao redirecionar para o servidor interno" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy rodando na porta ${PORT}`));
