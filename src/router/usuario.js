const express = require("express");
const router = express.Router();
const { body } = require('express-validator'); // Para validaciones de entrada en las rutas POST/PUT

// Importa el objeto controlador completo de usuarios
const usuarioController = require('../controller/usuario.controller');

// Rutas CRUD para usuarios

// GET /usuarios/ - Mostrar todos los usuarios
router.get('/', usuarioController.mostrarUsuarios);

// GET /usuarios/:id - Mostrar un usuario por ID
router.get('/:id', usuarioController.mostrarUsuarioPorId);

// POST /usuarios/ - Crear un nuevo usuario
// Se incluyen validaciones básicas con express-validator
router.post('/', [
    body('nombre').notEmpty().withMessage('El nombre es requerido.'),
    body('apellido').notEmpty().withMessage('El apellido es requerido.'),
    body('correo').isEmail().withMessage('El correo debe ser válido.').notEmpty().withMessage('El correo es requerido.'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    // Puedes añadir más validaciones para rolId, estado, etc.
], usuarioController.crearUsuario);

// PUT /usuarios/:id - Actualizar un usuario existente
router.put('/:id', usuarioController.actualizarUsuario);

// DELETE /usuarios/:id - Eliminar un usuario
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
