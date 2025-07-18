const mongoose = require('mongoose');

// Define el esquema para el modelo Reserva
const ReservaSchema = new mongoose.Schema({
  id_reserva: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_reserva sea al menos 1
  },
  fecha_reserva: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  }
}, {
  // Puedes especificar el nombre de la colección
  collection: 'reservas',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_reserva para búsquedas rápidas y asegurar unicidad
//ReservaSchema.index({ id_reserva: 1 }, { unique: true });

module.exports = mongoose.model('Reserva', ReservaSchema);