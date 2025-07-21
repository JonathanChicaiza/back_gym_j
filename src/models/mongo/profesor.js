const mongoose = require('mongoose');
const ProfesorSchema = new mongoose.Schema({
 id_profesorSql: String,
 horario_trabajo:String,
   dia: String,
   inicio: String,
   fin: String,
   experiencia: String,
   formacion_academica: String
}, {
 // Especifica el nombre de la colección como "profesores"
 collection: 'profesores',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Profesor', ProfesorSchema);