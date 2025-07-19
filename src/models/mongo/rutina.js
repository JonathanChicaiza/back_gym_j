const mongoose = require('mongoose');
const RutinaSchema = new mongoose.Schema({
 id_rutina: Number,
 descripcion: String,
 fecha_asignacion: Date
}, {
 // Especifica el nombre de la colección como "rutinas"
 collection: 'rutinas',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Rutina', RutinaSchema);