const mongoose = require('mongoose');
const EmpleadoSchema = new mongoose.Schema({
 id_empleadoSql: String,
 fecha_contratacion: String,
 fecha_nacimiento: String,
 pais: String
}, {
 // Especifica el nombre de la colección como "empleados"
 collection: 'empleados',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Empleado', EmpleadoSchema);