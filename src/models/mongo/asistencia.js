const mongoose = require('mongoose');
const AsistenciaSchema = new mongoose.Schema({
 id_asistencia: Number,
 fecha_asistencia: Date
}, {
 // Especifica el nombre de la colección como "asistencias"
 collection: 'asistencias',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Asistencia', AsistenciaSchema);