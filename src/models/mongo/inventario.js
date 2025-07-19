const mongoose = require('mongoose');
const InventarioSchema = new mongoose.Schema({
 id_inventario: Number,
 fecha_actualizacion: Date
}, {
 // Especifica el nombre de la colección como "inventario"
 collection: 'inventario',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Inventario', InventarioSchema);