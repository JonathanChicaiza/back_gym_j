const mongoose = require('mongoose');

// Define el esquema para el modelo HistorialPago
const HistorialPagoSchema = new mongoose.Schema({
  id_historial: {
    type: Number,
    required: true,
    unique: true,
    min: 1 // Opcional: Asegura que el id_historial sea al menos 1
  },
  observaciones: {
    type: String,
    required: false, // Las observaciones pueden ser opcionales
    maxlength: 1000 // Opcional: Permite observaciones más largas
  }
}, {
  // Especifica el nombre de la colección
  collection: 'historial_pagos', // Nombre de colección descriptivo
  timestamps: false // Desactiva los campos createdAt y updatedAt
});

// Índice para id_historial para búsquedas rápidas y asegurar unicidad
//HistorialPagoSchema.index({ id_historial: 1 }, { unique: true });

module.exports = mongoose.model('HistorialPago', HistorialPagoSchema);