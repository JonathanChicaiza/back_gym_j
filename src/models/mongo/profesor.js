const mongoose = require('mongoose');
const ProfesorSchema = new mongoose.Schema({
 id_profesor: Number,
 horario_trabajo: [{
   dia: String,
   inicio: String,
   fin: String
 }]
}, {
 // Especifica el nombre de la colección como "profesores"
 collection: 'profesores',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Profesor', ProfesorSchema);