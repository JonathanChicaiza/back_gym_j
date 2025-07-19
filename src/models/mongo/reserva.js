const mongoose = require('mongoose');
const ReservaSchema = new mongoose.Schema({
 id_reserva: Number,
 fecha_reserva: Date
}, {
 // Especifica el nombre de la colección como "reservas"
 collection: 'reservas',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Reserva', ReservaSchema);