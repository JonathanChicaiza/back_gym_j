const mongoose = require('mongoose');
const PagoSchema = new mongoose.Schema({
 id_pagoSql: String,
 concepto: String,
 fecha_vencimiento: String,
 intento_pago: String
}, {
 // Especifica el nombre de la colección como "pagos"
 collection: 'pagos',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Pago', PagoSchema);