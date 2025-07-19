const mongoose = require('mongoose');
const NotificacionSchema = new mongoose.Schema({
 id_notificacion: Number,
 fecha_envio: Date,
 leido: Boolean
}, {
 // Especifica el nombre de la colección como "notificaciones"
 collection: 'notificaciones',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Notificacion', NotificacionSchema);