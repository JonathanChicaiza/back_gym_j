const express = require('express');
const router = express.Router();
const {
    obtenerVisitas,
    obtenerVisita,
    crearVisita,
    actualizarVisita,
    eliminarVisita
} = require('../controller/visita.controller');

// Public routes (no authentication middleware here)
router.get('/', obtenerVisitas); // GET all visits
router.get('/:id', obtenerVisita); // GET single visit by ID
router.post('/crear', crearVisita); // POST new visit
router.put('/actualizar/:id', actualizarVisita); // PUT (update) visit by ID
router.delete('/eliminar/:id', eliminarVisita); // DELETE visit by ID

module.exports = router;