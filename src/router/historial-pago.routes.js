const express = require('express');
const router = express.Router();
const historialPagoController = require('../controller/historialPago.controller');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// Rutas para Historial de Pagos
router.get('/', 
    verificarToken, 
    verificarRol(['admin', 'contador']), 
    async (req, res) => {
        const result = await historialPagoController.mostrarHistoriales(req, res);
        if (result.error) {
            return res.status(400).json(result);
        }
        res.status(200).json(result);
    }
);

router.get('/:id', 
    verificarToken, 
    verificarRol(['admin', 'contador']), 
    async (req, res) => {
        const result = await historialPagoController.mostrarHistorialPorId(req, res);
        if (result.error) {
            return res.status(404).json(result);
        }
        res.status(200).json(result);
    }
);

router.post('/', 
    verificarToken, 
    verificarRol(['admin', 'contador']), 
    async (req, res) => {
        const result = await historialPagoController.crearHistorial(req, res);
        if (result.error) {
            return res.status(400).json(result);
        }
        res.status(201).json(result);
    }
);

router.put('/:id', 
    verificarToken, 
    verificarRol(['admin', 'contador']), 
    async (req, res) => {
        const result = await historialPagoController.actualizarHistorial(req, res);
        if (result.error) {
            return res.status(400).json(result);
        }
        res.status(200).json(result);
    }
);

router.delete('/:id', 
    verificarToken, 
    verificarRol(['admin']), 
    async (req, res) => {
        const result = await historialPagoController.eliminarHistorial(req, res);
        if (result.error) {
            return res.status(400).json(result);
        }
        res.status(200).json(result);
    }
);

module.exports = router;