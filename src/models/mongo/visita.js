const mongoose = require('mongoose');

// Define el esquema para el modelo Visita
const VisitaSchema = new mongoose.Schema({
  id_visita: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_visita sea al menos 1
  },
  fecha_visita: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  }
}, {
  // Puedes especificar el nombre de la colección
  collection: 'visitas',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_visita para búsquedas rápidas y asegurar unicidad
//VisitaSchema.index({ id_visita: 1 }, { unique: true });

module.exports = mongoose.model('Visita', VisitaSchema);