const express = require("express");
const router = express.Router();

const {
  guardarParticipante,
  obtenerParticipantes
} = require("../controllers/participantes.controller");

router.post("/", guardarParticipante);
router.get("/", obtenerParticipantes);

module.exports = router;