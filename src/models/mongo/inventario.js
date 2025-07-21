const mongoose = require('mongoose');
const InventarioSchema = new mongoose.Schema({
 id_inventarioSql: String,
 fecha_actualizacion: String,
 categoria: String,
 stock: String,
}, {
 // Especifica el nombre de la colección como "inventario"
 collection: 'inventario',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Inventario', InventarioSchema);