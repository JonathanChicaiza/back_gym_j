const mongoose = require('mongoose');

// Define el esquema para el modelo Clase
const ClaseSchema = new mongoose.Schema({
  id_clase: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_clase sea al menos 1
  },
  descripcion: {
    type: String,
    required: false, // Puedes cambiarlo a 'true' si la descripción es siempre obligatoria
    maxlength: 500 // Opcional: Limita la longitud máxima de la descripción
  }
}, {
  // Opcional: Puedes especificar el nombre de la colección
  collection: 'clases', // Nombre de colección más común
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_clase para búsquedas rápidas y asegurar unicidad
//ClaseSchema.index({ id_clase: 1 }, { unique: true });

module.exports = mongoose.model('Clase', ClaseSchema);