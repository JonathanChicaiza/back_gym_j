const express = require('express');
const router = express.Router();
const {
  mostrarReservaPorId,
  crearReserva,
  actualizarReserva,
  eliminarReserva
} = require('../controller/reserva.controller');

// Routes
router.get('/:id', mostrarReservaPorId);
router.post('/crear', crearReserva);
router.put('/:id', actualizarReserva);
router.delete('/:id', eliminarReserva);

module.exports = router;