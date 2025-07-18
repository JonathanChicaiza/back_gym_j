const express = require('express');
const router = express.Router();
const { 
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente
} = require('../controller/cliente.controller');

// Rutas CRUD
router.get('/:id', obtenerCliente);
router.post('/crear', crearCliente);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarCliente);

module.exports = router;