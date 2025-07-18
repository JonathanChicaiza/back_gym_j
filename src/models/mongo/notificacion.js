const mongoose = require('mongoose');

// Define el esquema para el modelo Notificacion
const NotificacionSchema = new mongoose.Schema({
  id_notificacion: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_notificacion sea al menos 1
  },
  fecha_envio: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  },
  leido: {
    type: Boolean,
    required: true,
    default: false // Por defecto, una notificación no ha sido leída
  }
}, {
  // Puedes especificar el nombre de la colección
  collection: 'notificaciones',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_notificacion para búsquedas rápidas y asegurar unicidad
//NotificacionSchema.index({ id_notificacion: 1 }, { unique: true });

module.exports = mongoose.model('Notificacion', NotificacionSchema);