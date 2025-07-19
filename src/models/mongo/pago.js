const mongoose = require('mongoose');
const PagoSchema = new mongoose.Schema({
 id_pago: Number,
 concepto: String
}, {
 // Especifica el nombre de la colección como "pagos"
 collection: 'pagos',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Pago', PagoSchema);