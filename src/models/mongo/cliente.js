const mongoose = require('mongoose');

// Define el esquema para el modelo Cliente
const ClienteSchema = new mongoose.Schema({
  id_cliente: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_cliente sea al menos 1
  },
  fecha_nacimiento: {
    type: Date,
    required: true // La fecha de nacimiento es obligatoria
  }
}, {
  // Opcional: Puedes mantener el nombre de la colección si lo deseas
  collection: 'clientes',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_cliente para búsquedas rápidas y asegurar unicidad
//ClienteSchema.index({ id_cliente: 1 }, { unique: true });

module.exports = mongoose.model('Cliente', ClienteSchema);