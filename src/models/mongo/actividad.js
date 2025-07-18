const mongoose = require('mongoose');

// Define el esquema para el modelo Actividad
const ActividadSchema = new mongoose.Schema({
  id_log: {
    type: Number,
    required: true,
    unique: true, // <-- Esto ya crea el índice único en MongoDB
    min: 1 // Opcional: Asegura que el id_log sea al menos 1
  },
  fecha_hora: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  }
}, {
  // Especifica el nombre de la colección como "actividad"
  collection: 'actividad',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// ¡IMPORTANTE!: La siguiente línea ha sido ELIMINADA porque 'unique: true' en el campo ya es suficiente.
// ActividadSchema.index({ id_log: 1 }, { unique: true });

module.exports = mongoose.model('Actividad', ActividadSchema);
