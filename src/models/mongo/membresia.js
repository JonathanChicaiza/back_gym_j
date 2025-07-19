const mongoose = require('mongoose');
const MembresiaSchema = new mongoose.Schema({
 id_membresia: Number,
 descripcion: String,
 beneficios: [String]
}, {
 // Especifica el nombre de la colección como "membresias"
 collection: 'membresias',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Membresia', MembresiaSchema);