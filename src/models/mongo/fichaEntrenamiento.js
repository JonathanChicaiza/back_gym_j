const mongoose = require('mongoose');

// Define el esquema para el modelo Ficha
const FichaSchema = new mongoose.Schema({
  id_ficha: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_ficha sea al menos 1
  },
  descripcion: {
    type: String,
    required: true,
    maxlength: 1000 // Opcional: Amplía el tamaño si las descripciones pueden ser largas
  },
  fecha_creacion: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  }
}, {
  // Puedes especificar el nombre de la colección
  collection: 'fichas_entrenamiento',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_ficha para búsquedas rápidas y asegurar unicidad
//FichaSchema.index({ id_ficha: 1 }, { unique: true });

module.exports = mongoose.model('Ficha', FichaSchema);