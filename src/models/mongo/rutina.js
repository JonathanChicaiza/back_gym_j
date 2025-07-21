const mongoose = require('mongoose');
const RutinaSchema = new mongoose.Schema({
 id_rutinaSql: String,
 descripcion: String,
 fecha_asignacion: String,
 ejercicios: String,
 nivel_dificultad: String,
 progreso_actual: String
}, {
 // Especifica el nombre de la colección como "rutinas"
 collection: 'rutinas',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Rutina', RutinaSchema);