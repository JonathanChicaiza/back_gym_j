const mongoose = require('mongoose');

// Define el esquema para el modelo Rutina
const RutinaSchema = new mongoose.Schema({
  id_rutina: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_rutina sea al menos 1
  },
  descripcion: {
    type: String,
    required: true,
    maxlength: 1000 // Permite descripciones más detalladas
  },
  fecha_asignacion: {
    type: Date,
    required: true,
    default: Date.now // Establece la fecha y hora actuales por defecto
  }
}, {
  // Especifica el nombre de la colección en la base de datos
  collection: 'rutinas',
  timestamps: false // Desactiva los campos createdAt y updatedAt automáticos
});

// Índice para id_rutina para búsquedas rápidas y asegurar unicidad
//RutinaSchema.index({ id_rutina: 1 }, { unique: true });

module.exports = mongoose.model('Rutina', RutinaSchema);