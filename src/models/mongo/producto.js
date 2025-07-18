const mongoose = require('mongoose');

// Define el esquema para el modelo Producto
const ProductoSchema = new mongoose.Schema({
  id_producto: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_producto sea al menos 1
  },
  descripcion: {
    type: String,
    required: false, // Puedes cambiarlo a 'true' si la descripción es siempre obligatoria
    maxlength: 500 // Opcional: Limita la longitud máxima de la descripción
  }
}, {
  // Opcional: Puedes especificar el nombre de la colección
  collection: 'productos',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_producto para búsquedas rápidas y asegurar unicidad
//ProductoSchema.index({ id_producto: 1 }, { unique: true });

module.exports = mongoose.model('Producto', ProductoSchema);