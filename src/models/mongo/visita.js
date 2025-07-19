const mongoose = require('mongoose');
const VisitaSchema = new mongoose.Schema({
 id_visita: Number,
 fecha_visita: Date
}, {
 // Especifica el nombre de la colección como "visitas"
 collection: 'visitas',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Visita', VisitaSchema);