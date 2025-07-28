// router/auth.routes.js
const express = require("express");
const router = express.Router();
const passport = require('passport'); // Make sure passport is imported

// Assuming crearUsuario and other necessary functions are available in your user controller
const {
  crearUsuario,
  // If your login controller or logic is in usuario.controller, import it here.
  // Otherwise, ensure the passport.authenticate for signin is handled directly.
} = require('../controller/usuario.controller'); // Adjust path if needed

// Route for User Registration (Signup)
// This becomes POST /api/auth/signup
router.post('/signup', crearUsuario);

// Route for User Login (Signin)
// This becomes POST /api/auth/signin
router.post('/signin', (req, res, next) => {
    passport.authenticate('local.usuarioSignin', (err, user, info) => {
        if (err) {
            console.error('Error en autenticación de login:', err);
            // ... (rest of your error handling and response logic for signin) ...
            const customError = new Error('Error interno del servidor durante el inicio de sesión.');
            customError.statusCode = 500;
            return next(customError);
        }
        if (!user) {
            const errorMessage = info && info.message ? info.message : 'Credenciales incorrectas.';
            const customError = new Error(errorMessage);
            customError.statusCode = 401; // Unauthorized
            return next(customError);
        }

        req.logIn(user, async (err) => {
            if (err) {
                console.error('Error al iniciar sesión (controlador login):', err);
                const customError = new Error('Error interno del servidor al iniciar sesión.');
                customError.statusCode = 500;
                return next(customError);
            }
            const { generateToken } = require('../lib/passport'); // Adjust path as needed
            const token = generateToken(user);

            return res.status(200).json({
                message: 'Inicio de sesión exitoso.',
                user: {
                    idUsuario: user.idUsuario,
                    nombre: user.nombre,
                    correo: user.correo,
                },
                token: token
            });
        });
    })(req, res, next);
});

// If you still have the mostrarMensaje route:
// router.get('/', mostrarMensaje);

module.exports = router;