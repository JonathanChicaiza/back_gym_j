const mongoose = require('mongoose');
const EmpleadoSchema = new mongoose.Schema({
 id_empleado: Number,
 salario: Number,
 fecha_contratacion: Date
}, {
 // Especifica el nombre de la colección como "empleados"
 collection: 'empleados',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Empleado', EmpleadoSchema);