const mongoose = require('mongoose');
const ClaseSchema = new mongoose.Schema({
 id_clase: Number,
 descripcion: String
}, {
 // Especifica el nombre de la colección como "clases"
 collection: 'clases',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Clase', ClaseSchema);