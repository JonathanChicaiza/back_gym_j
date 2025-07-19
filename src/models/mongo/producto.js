const mongoose = require('mongoose');
const ProductoSchema = new mongoose.Schema({
 id_producto: Number,
 descripcion: String
}, {
 // Especifica el nombre de la colección como "productos"
 collection: 'productos',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Producto', ProductoSchema);