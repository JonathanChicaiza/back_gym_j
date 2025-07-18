const mongoose = require('mongoose');

// Define el esquema para el modelo Inventario
const InventarioSchema = new mongoose.Schema({
  id_inventario: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_inventario sea al menos 1
  },
  fecha_actualizacion: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  }
}, {
  // Puedes especificar el nombre de la colección
  collection: 'inventario',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_inventario para búsquedas rápidas y asegurar unicidad
//InventarioSchema.index({ id_inventario: 1 }, { unique: true });

module.exports = mongoose.model('Inventario', InventarioSchema);