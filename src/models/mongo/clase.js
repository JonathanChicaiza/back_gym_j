const mongoose = require('mongoose');
const ClaseSchema = new mongoose.Schema({
 id_claseSql: String,
 descripcion: String,
 estadistica: String,
 categoria: String,
 ultima_modificacion: String
}, {
 // Especifica el nombre de la colección como "clases"
 collection: 'clases',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Clase', ClaseSchema);