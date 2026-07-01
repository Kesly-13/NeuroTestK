const express = require("express");
const cors = require("cors");
const participantesRoutes = require("./routes/participantes.routes");
require("dotenv").config();

// Importar la conexión a la base de datos
require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/participantes", participantesRoutes);

app.get("/", (req, res) => {
    res.json({
        mensaje: "🚀 Backend de NeuroTest funcionando correctamente."
    });
});

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
});