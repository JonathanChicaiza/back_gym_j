const mongoose = require('mongoose');

// Define el esquema para el modelo Pago
const PagoSchema = new mongoose.Schema({
  id_pago: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_pago sea al menos 1
  },
  concepto: {
    type: String,
    required: true,
    maxlength: 200 // Opcional: Limita la longitud máxima del concepto
  }
}, {
  // Opcional: Mantén el nombre de la colección si lo deseas
  collection: 'pagos',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_pago para búsquedas rápidas y asegurar unicidad
//PagoSchema.index({ id_pago: 1 }, { unique: true });

module.exports = mongoose.model('Pago', PagoSchema);