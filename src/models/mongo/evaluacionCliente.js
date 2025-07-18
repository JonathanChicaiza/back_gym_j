const mongoose = require('mongoose');

// Define el esquema para el modelo EvaluacionCliente
const EvaluacionClienteSchema = new mongoose.Schema({
  id_evaluacion: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_evaluacion sea al menos 1
  },
  comentario: {
    type: String,
    required: true,
    maxlength: 1000 // Opcional: Permite comentarios más largos
  },
  fecha_evaluacion: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  }
}, {
  // Especifica el nombre de la colección
  collection: 'evaluaciones_clientes', // Nombre de colección descriptivo
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_evaluacion para búsquedas rápidas y asegurar unicidad
//EvaluacionClienteSchema.index({ id_evaluacion: 1 }, { unique: true });

module.exports = mongoose.model('EvaluacionCliente', EvaluacionClienteSchema);