const mongoose = require('mongoose');
const ClienteSchema = new mongoose.Schema({
 id_clienteSql: String,
 fecha_nacimiento: String,
 genero: String,
 preferencia: String,
 ultimo_acceso: String,
 historial_compras: String
}, {
 // Especifica el nombre de la colección como "clientes"
 collection: 'clientes',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Cliente', ClienteSchema);