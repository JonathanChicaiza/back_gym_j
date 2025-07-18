const mongoose = require('mongoose');

// Define el esquema para el modelo Profesor
const ProfesorSchema = new mongoose.Schema({
  id_profesor: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_profesor sea al menos 1
  },
  horario_trabajo: {
    type: [{
      dia: {
        type: String,
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        required: true // El día del horario es obligatorio
      },
      inicio: {
        type: String, // Formato "HH:MM", por ejemplo "09:00"
        required: true
      },
      fin: {
        type: String, // Formato "HH:MM", por ejemplo "17:00"
        required: true
      }
    }],
    default: [], // Por defecto, el horario puede estar vacío
    required: true // El campo horario_trabajo en sí es obligatorio, aunque pueda estar vacío
  }
}, {
  // Opcional: Puedes especificar el nombre de la colección
  collection: 'profesores',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_profesor para búsquedas rápidas y asegurar unicidad
//ProfesorSchema.index({ id_profesor: 1 }, { unique: true });

// Validación personalizada para horario: Asegura que la hora de inicio sea anterior a la de fin
ProfesorSchema.path('horario_trabajo').validate(function(horarios) {
  for (const horario of horarios) {
    if (horario.inicio && horario.fin && horario.inicio >= horario.fin) {
      // Usar un mensaje más específico si es posible
      throw new Error('En el horario de trabajo, la hora de inicio debe ser anterior a la hora de fin para cada entrada.');
    }
  }
  return true;
}, 'Horario de trabajo inválido: la hora de inicio debe ser anterior a la hora de fin.');


module.exports = mongoose.model('Profesor', ProfesorSchema);