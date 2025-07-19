const mongoose = require('mongoose');
const UsuarioSchema = new mongoose.Schema({
 id_usuario: Number,
 fecha_registro: Date
}, {
 // Especifica el nombre de la colección como "usuarios"
 collection: 'usuarios',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Usuario', UsuarioSchema);