const mongoose = require('mongoose');
const VisitaSchema = new mongoose.Schema({
 id_visitaSql: String,
 fecha_visita: String,
 responsable: String,
 ubicacion: String,
 observacion: String
}, {
 // Especifica el nombre de la colección como "visitas"
 collection: 'visitas',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Visita', VisitaSchema);