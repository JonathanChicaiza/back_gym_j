const mongoose = require('mongoose');
const ConfiguracionSchema = new mongoose.Schema({
idconfiguracionSql: String,
 mision: String,
 vision: String,
 objetivos: String,
 createConfiguracion: String,
 updateConfiguracion: String
}, {
 // Especifica el nombre de la colección como "configuraciones"
 collection: 'configuraciones',
 timestamps: false // Desactiva los campos createdAt y updatedAt
});

module.exports = mongoose.model('Configuracion', ConfiguracionSchema);