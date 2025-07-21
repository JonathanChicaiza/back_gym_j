const mongoose = require('mongoose');
const EvaluacionClienteSchema = new mongoose.Schema({
 id_evaluacionSql: String,
 comentario: String,
 tipo_evaluacion: String,
 fecha_evaluacion: String,
 calificacion: String,
 ubicacion: String
}, {
 // Especifica el nombre de la colección como "evaluaciones_clientes"
 collection: 'evaluaciones_clientes',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('EvaluacionCliente', EvaluacionClienteSchema);