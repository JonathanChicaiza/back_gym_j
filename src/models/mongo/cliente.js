const mongoose = require('mongoose');
const ClienteSchema = new mongoose.Schema({
 id_cliente: Number,
 fecha_nacimiento: Date
}, {
 // Especifica el nombre de la colección como "clientes"
 collection: 'clientes',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Cliente', ClienteSchema);