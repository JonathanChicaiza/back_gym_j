const mongoose = require('mongoose');
const VentaSchema = new mongoose.Schema({
 id_venta: Number,
 fecha_venta: Date
}, {
 // Especifica el nombre de la colección como "ventas"
 collection: 'ventas',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Venta', VentaSchema);