const mongoose = require('mongoose');
const MembresiaSchema = new mongoose.Schema({
 id_membresiaSql: String,
 descripcion: String,
 beneficios: String,
 historial_uso: String, 
 acceso_recursos : String
}, {
 // Especifica el nombre de la colección como "membresias"
 collection: 'membresias',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Membresia', MembresiaSchema);