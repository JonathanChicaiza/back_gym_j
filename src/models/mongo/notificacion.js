const mongoose = require('mongoose');
const NotificacionSchema = new mongoose.Schema({
 id_notificacionSql: String,
 fecha_envio: String,
 leido: String,
 prioridad: String,
 canal_envio: String,
 fecha_lectura: String

}, {
 // Especifica el nombre de la colección como "notificaciones"
 collection: 'notificaciones',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Notificacion', NotificacionSchema);