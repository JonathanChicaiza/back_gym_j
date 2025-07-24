const mongoose = require('mongoose');
const ReservaSchema = new mongoose.Schema({
 id_reservaSql: String,
 fecha_reserva: String,
 tipo_reserva: String,
 descripcion: String,
 cantidad_personas: String
}, {
 // Especifica el nombre de la colección como "reservas"
 collection: 'reservas',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Reserva', ReservaSchema);