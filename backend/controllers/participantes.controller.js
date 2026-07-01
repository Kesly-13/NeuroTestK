const db = require("../config/db");

// Guardar participante
const guardarParticipante = (req, res) => {
  const {
    nombre,
    inteligencia_principal,
    estilo_aprendizaje,
    resultado_mi,
    resultado_ls
  } = req.body;

  const sql = `
    INSERT INTO participantes
    (nombre, inteligencia_principal, estilo_aprendizaje, resultado_mi, resultado_ls)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nombre,
      inteligencia_principal,
      estilo_aprendizaje,
      JSON.stringify(resultado_mi),
      JSON.stringify(resultado_ls)
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          mensaje: "Error al guardar participante"
        });
      }

      res.status(201).json({
        mensaje: "Participante guardado correctamente"
      });
    }
  );
};

// Obtener participantes
const obtenerParticipantes = (req, res) => {
  db.query(
    "SELECT * FROM participantes ORDER BY fecha_registro DESC",
    (err, rows) => {

      if (err) {
        console.error(err);
        return res.status(500).json({
          mensaje: "Error al obtener participantes"
        });
      }

      res.json(rows);

    }
  );
};

module.exports = {
  guardarParticipante,
  obtenerParticipantes
};