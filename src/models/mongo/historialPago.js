const mongoose = require('mongoose');
const HistorialPagoSchema = new mongoose.Schema({
 id_historialSql: String,
 observaciones: String,
 fecha_pago: String,
 ubicacion: String
}, {
 // Especifica el nombre de la colección como "historial_pagos"
 collection: 'historial_pagos',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('HistorialPago', HistorialPagoSchema);