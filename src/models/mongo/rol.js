const mongoose = require('mongoose');
const RolSchema = new mongoose.Schema({
 id_rol: Number,
 descripcion: String
}, {
 // Especifica el nombre de la colección como "rols"
 collection: 'rols',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Rol', RolSchema);