const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuario.controller');
const { check } = require('express-validator');
const passport = require('passport');

// Middleware para validar ID
router.param('id', (req, res, next, id) => {
    if (!Number.isInteger(parseInt(id))) {
        return res.status(400).json({ 
            success: false,
            error: 'ID inválido, debe ser un número entero' 
        });
    }
    next();
});

// Middleware de autenticación para rutas protegidas
const authenticate = passport.authenticate('jwt', { session: false });

// Validaciones comunes
const validarCrearUsuario = [
    check('nombre').notEmpty().withMessage('El nombre es requerido'),
    check('apellido').notEmpty().withMessage('El apellido es requerido'),
    check('correo').isEmail().withMessage('Debe ser un email válido'),
    check('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    check('rolId').optional().isInt({ min: 1 }).withMessage('El rol debe ser un ID válido')
];

const validarActualizarUsuario = [
    check('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    check('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío'),
    check('correo').optional().isEmail().withMessage('Debe ser un email válido'),
    check('password').optional().isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    check('rolId').optional().isInt({ min: 1 }).withMessage('El rol debe ser un ID válido'),
    check('estado').optional().isIn(['activo', 'inactivo']).withMessage('Estado no válido')
];

// Obtener todos los usuarios (protegido, solo admin)
router.get('/', authenticate, async (req, res) => {
    try {
        // Verificar si el usuario es administrador
        if (req.user.rolId !== 1) { // Asumiendo que 1 es el ID para admin
            return res.status(403).json({ 
                success: false, 
                error: 'No autorizado' 
            });
        }

        const result = await usuarioController.mostrarUsuarios(req, res);
        res.json({ 
            success: true, 
            data: result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener usuarios',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtener un usuario por ID (protegido, usuario puede ver su propio perfil)
router.get('/:id', authenticate, async (req, res) => {
    try {
        // Verificar si el usuario es admin o está accediendo a su propio perfil
        if (req.user.rolId !== 1 && req.user.idUsuario !== parseInt(req.params.id)) {
            return res.status(403).json({ 
                success: false, 
                error: 'No autorizado' 
            });
        }

        const result = await usuarioController.mostrarUsuarioPorId(req, res);
        
        if (result.message) {
            return res.status(404).json({ 
                success: false, 
                error: result.message 
            });
        }
        
        res.json({ 
            success: true, 
            data: result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener el usuario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Crear un nuevo usuario (público para registro)
router.post('/', validarCrearUsuario, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const result = await usuarioController.crearUsuario(req, res);
        
        if (result.message && result.message.includes('ya existen')) {
            return res.status(409).json({ 
                success: false, 
                error: result.message 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idUsuario: result.idUsuario,
            nombre: result.nombre,
            correo: result.correo
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear el usuario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Actualizar un usuario existente (protegido, usuario puede actualizar su propio perfil)
router.put('/:id', authenticate, validarActualizarUsuario, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Verificar si el usuario es admin o está actualizando su propio perfil
        if (req.user.rolId !== 1 && req.user.idUsuario !== parseInt(req.params.id)) {
            return res.status(403).json({ 
                success: false, 
                error: 'No autorizado' 
            });
        }

        const result = await usuarioController.actualizarUsuario(req, res);
        
        if (result.message && result.message.includes('ya existe')) {
            return res.status(409).json({ 
                success: false, 
                error: result.message 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar el usuario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Eliminar un usuario (protegido, solo admin)
router.delete('/:id', authenticate, async (req, res) => {
    try {
        // Verificar si el usuario es administrador
        if (req.user.rolId !== 1) {
            return res.status(403).json({ 
                success: false, 
                error: 'No autorizado' 
            });
        }

        const result = await usuarioController.eliminarUsuario(req, res);
        
        if (result.message === 'Usuario no encontrado.') {
            return res.status(404).json({ 
                success: false, 
                error: result.message 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al eliminar el usuario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Ruta para cambiar contraseña (protegida)
router.post('/:id/cambiar-password', authenticate, [
    check('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
    check('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Verificar si el usuario está cambiando su propia contraseña
        if (req.user.idUsuario !== parseInt(req.params.id)) {
            return res.status(403).json({ 
                success: false, 
                error: 'No autorizado' 
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Obtener usuario de la base de datos
        const [user] = await sql.promise().query('SELECT * FROM usuarios WHERE idUsuario = ?', [req.params.id]);
        
        if (!user.length) {
            return res.status(404).json({ 
                success: false, 
                error: 'Usuario no encontrado' 
            });
        }

        // Verificar contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user[0].contraseña);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                error: 'Contraseña actual incorrecta' 
            });
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await orm.usuario.update({ contraseña: hashedPassword }, {
            where: { idUsuario: req.params.id }
        });

        res.json({ 
            success: true, 
            message: 'Contraseña actualizada con éxito' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al cambiar la contraseña',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;