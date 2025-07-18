const mongoose = require('mongoose');

const ConfiguracionSchema = new mongoose.Schema({
  mision: {
    type: String,
    required: true
  },
  vision: {
    type: String,
    required: true
  },
  objetivos: {
    type: String,
    required: true
  }
}, {
  timestamps: false,  // Opcional: Si no quieres campos createdAt/updatedAt
  collection: 'configuraciones'  // Nombre personalizado para la colección
});

module.exports = mongoose.model('Configuracion', ConfiguracionSchema);