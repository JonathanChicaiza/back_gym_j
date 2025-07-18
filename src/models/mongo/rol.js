const mongoose = require('mongoose');

// Define el esquema para el modelo Rol
const rolSchema = new mongoose.Schema({
  id_rol: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_rol sea al menos 1
  },
  descripcion: {
    type: String,
    required: true,
    maxlength: 100 // Opcional: Limita la longitud máxima de la descripción
  }
});

// Crea el modelo Rol a partir del esquema
const Rol = mongoose.model('Rol', rolSchema);

module.exports = Rol;