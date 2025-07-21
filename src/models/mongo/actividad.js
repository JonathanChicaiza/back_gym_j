const mongoose = require('mongoose');
const ActividadSchema = new mongoose.Schema({
  id_logSql: String,
  fecha: String,
  hora:  String,
  ciudad: String,
  pais: String
}, {
  // Especifica el nombre de la colección como "actividad"
  collection: 'actividad',
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Actividad', ActividadSchema);