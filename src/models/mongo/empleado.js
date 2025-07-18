const mongoose = require('mongoose');

// Define el esquema para el modelo Empleado
const EmpleadoSchema = new mongoose.Schema({
  id_empleado: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_empleado sea al menos 1
  },
  salario: {
    type: Number,
    required: true,
    min: 0 // El salario no puede ser negativo
  },
  fecha_contratacion: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha de contratación a la fecha y hora actuales por defecto
  }
}, {
  // Opcional: Puedes especificar el nombre de la colección
  collection: 'empleados',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_empleado para búsquedas rápidas y asegurar unicidad
//EmpleadoSchema.index({ id_empleado: 1 }, { unique: true });

module.exports = mongoose.model('Empleado', EmpleadoSchema);