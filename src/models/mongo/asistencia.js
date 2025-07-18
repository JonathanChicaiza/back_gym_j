const mongoose = require('mongoose');

// Define el esquema para el modelo Asistencia
const AsistenciaSchema = new mongoose.Schema({
  id_asistencia: {
    type: Number,
    required: true,
    unique: true, // <-- Esto ya crea el índice único en MongoDB
    min: 1 // Opcional: Asegura que el id_asistencia sea al menos 1
  },
  fecha_asistencia: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  }
}, {
  // Especifica el nombre de la colección en la base de datos
  collection: 'asistencias', // Nombre de colección descriptivo
  timestamps: false // Desactiva los campos createdAt y updatedAt automáticos
});

// ¡IMPORTANTE!: La siguiente línea ha sido ELIMINADA porque 'unique: true' en el campo ya es suficiente.
// AsistenciaSchema.index({ id_asistencia: 1 }, { unique: true });

module.exports = mongoose.model('Asistencia', AsistenciaSchema);
