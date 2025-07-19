const mongoose = require('mongoose');
const EvaluacionClienteSchema = new mongoose.Schema({
 id_evaluacion: Number,
 comentario: String,
 fecha_evaluacion: Date
}, {
 // Especifica el nombre de la colección como "evaluaciones_clientes"
 collection: 'evaluaciones_clientes',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('EvaluacionCliente', EvaluacionClienteSchema);