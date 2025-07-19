const mongoose = require('mongoose');
const FichaSchema = new mongoose.Schema({
 id_ficha: Number,
 descripcion: String,
 fecha_creacion: Date
}, {
 // Especifica el nombre de la colección como "fichas_entrenamiento"
 collection: 'fichas_entrenamiento',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Ficha', FichaSchema);