const mongoose = require('mongoose');

// Define el esquema para el modelo Membresia
const MembresiaSchema = new mongoose.Schema({
  id_membresia: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_membresia sea al menos 1
  },
  descripcion: {
    type: String,
    required: true,
    maxlength: 100 // Opcional: Limita la longitud máxima de la descripción
  },
  beneficios: {
    type: [String], // Un array de cadenas de texto para múltiples beneficios
    required: true
  }
}, {
  collection: 'membresias', // Nombre personalizado para la colección en MongoDB
  timestamps: false // Desactiva los campos createdAt y updatedAt automáticos de Mongoose
});

// Índice para asegurar la unicidad y mejorar la búsqueda por id_membresia
//MembresiaSchema.index({ id_membresia: 1 }, { unique: true });

module.exports = mongoose.model('Membresia', MembresiaSchema);