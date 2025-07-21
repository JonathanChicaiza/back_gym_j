const mongoose = require('mongoose');
const VentaSchema = new mongoose.Schema({
 id_ventaSql: String,
 fecha_venta: String,
 dispositivo_venta: String,
 ubicacion_venta: String
}, {
 // Especifica el nombre de la colección como "ventas"
 collection: 'ventas',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Venta', VentaSchema);