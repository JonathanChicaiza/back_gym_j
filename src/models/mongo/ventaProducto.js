const mongoose = require('mongoose');

// Define el esquema para el modelo Venta
const VentaSchema = new mongoose.Schema({
  id_venta: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_venta sea al menos 1
  },
  fecha_venta: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  }
}, {
  // Puedes especificar el nombre de la colección
  collection: 'ventas',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_venta para búsquedas rápidas y asegurar unicidad
//VentaSchema.index({ id_venta: 1 }, { unique: true });

module.exports = mongoose.model('Venta', VentaSchema);