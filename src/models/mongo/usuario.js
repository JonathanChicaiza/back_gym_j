const mongoose = require('mongoose');

// Define el esquema para el modelo Usuario
const UsuarioSchema = new mongoose.Schema({
  id_usuario: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_usuario sea al menos 1
  },
  fecha_registro: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  }
}, {
  // Opcional: Mantener el nombre de la colección si lo prefieres
  collection: 'usuarios',
  // Asegúrate de que timestamps esté en false si solo quieres controlar fecha_registro manualmente
  timestamps: false
});

// Puedes añadir un índice para id_usuario para búsquedas rápidas si lo necesitas
//UsuarioSchema.index({ id_usuario: 1 }, { unique: true });

// Exporta el modelo
module.exports = mongoose.model('Usuario', UsuarioSchema);