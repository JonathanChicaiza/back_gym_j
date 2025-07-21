const mongoose = require('mongoose');
const FichaSchema = new mongoose.Schema({
 id_fichaSql: String,
 descripcion: String,
 fecha_creacion: String,
 nivel_dificulta: String,
 rutina: String,
 duracion_minutos: String
}, {
 // Especifica el nombre de la colección como "fichas_entrenamiento"
 collection: 'fichas_entrenamiento',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Ficha', FichaSchema);