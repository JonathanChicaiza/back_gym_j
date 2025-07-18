// src/models/sql/index.js
// Corrección en la ruta de importación de database
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

// Importar todos tus modelos individuales
const Rol = require('./rolModel'); // <--- CORRECCIÓN AQUÍ (es ruta local en la misma carpeta)
const Usuario = require('./usuarioModel'); // <--- CORRECCIÓN AQUÍ
const Configuracion = require('./configuracionModel'); // <--- CORRECCIÓN AQUÍ
const Cliente = require('./clienteModel'); // <--- CORRECCIÓN AQUÍ
const Membresia = require('./membresiaModel'); // <--- CORRECCIÓN AQUÍ
const Pago = require('./pagoModel'); // <--- CORRECCIÓN AQUÍ
const Visita = require('./visitaModel'); // <--- CORRECCIÓN AQUÍ
const Trabajador = require('./trabajadorModel'); // <--- CORRECCIÓN AQUÍ
const Profesor = require('./profesorModel'); // <--- CORRECCIÓN AQUÍ
const Clase = require('./claseModel'); // <--- CORRECCIÓN AQUÍ
const Reserva = require('./reservaModel'); // <--- CORRECCIÓN AQUÍ
const Ficha = require('./fichaModel'); // <--- CORRECCIÓN AQUÍ
const Producto = require('./productoModel'); // <--- CORRECCIÓN AQUÍ
const Inventario = require('./inventarioModel'); // <--- CORRECCIÓN AQUÍ

function definirAsociaciones() {
  try {
    // 1. Usuario -> Rol (RF14, RF15, HU01)
    Usuario.belongsTo(Rol, {
      foreignKey: 'rol_id',
      as: 'rol',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
    Rol.hasMany(Usuario, {
      foreignKey: 'rol_id',
      as: 'usuarios'
    });

    // 2. Configuración -> Usuario (HU02)
    Configuracion.belongsTo(Usuario, {
      foreignKey: 'creado_por',
      as: 'creador',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    Usuario.hasOne(Configuracion, {
      foreignKey: 'creado_por',
      as: 'configuracion'
    });

    // 3. Cliente -> Membresia (HU03, HU04)
    Cliente.belongsTo(Membresia, {
      foreignKey: 'membresia_id',
      as: 'membresia',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    Membresia.hasMany(Cliente, {
      foreignKey: 'membresia_id',
      as: 'clientes'
    });

    // 4. Pago -> Cliente (HU05)
    Pago.belongsTo(Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Cliente.hasMany(Pago, {
      foreignKey: 'cliente_id',
      as: 'pagos'
    });

    // 5. Visita -> Cliente (HU05)
    Visita.belongsTo(Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Cliente.hasMany(Visita, {
      foreignKey: 'cliente_id',
      as: 'visitas'
    });

    // 6. Trabajador -> Rol (HU06)
    Trabajador.belongsTo(Rol, {
      foreignKey: 'rol_id',
      as: 'rol',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
    Rol.hasMany(Trabajador, {
      foreignKey: 'rol_id',
      as: 'trabajadores'
    });

    // 7. Clase -> Profesor (HU07)
    Clase.belongsTo(Profesor, {
      foreignKey: 'profesor_id',
      as: 'profesor',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    Profesor.hasMany(Clase, {
      foreignKey: 'profesor_id',
      as: 'clases'
    });

    // 8. Reserva -> Cliente y Clase (HU07)
    Reserva.belongsTo(Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Cliente.hasMany(Reserva, {
      foreignKey: 'cliente_id',
      as: 'reservas'
    });

    Reserva.belongsTo(Clase, {
      foreignKey: 'clase_id',
      as: 'clase',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Clase.hasMany(Reserva, {
      foreignKey: 'clase_id',
      as: 'reservas'
    });

    // 9. Ficha -> Cliente y Profesor (HU08)
    Ficha.belongsTo(Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Cliente.hasMany(Ficha, {
      foreignKey: 'cliente_id',
      as: 'fichas'
    });

    Ficha.belongsTo(Profesor, {
      foreignKey: 'profesor_id',
      as: 'profesor',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    Profesor.hasMany(Ficha, {
      foreignKey: 'profesor_id',
      as: 'fichas'
    });

    // 10. Inventario -> Producto (HU09 - Opcional)
    Inventario.belongsTo(Producto, {
      foreignKey: 'producto_id',
      as: 'producto',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Producto.hasMany(Inventario, {
      foreignKey: 'producto_id',
      as: 'inventarios'
    });

    console.log('✅ Todas las asociaciones configuradas correctamente');
  } catch (error) {
    console.error('❌ Error configurando asociaciones:', error);
    throw error;
  }
}

module.exports = {
  Rol,
  Usuario,
  Configuracion,
  Membresia,
  Cliente,
  Pago,
  Visita,
  Trabajador,
  Profesor,
  Clase,
  Reserva,
  Ficha,
  Producto,
  Inventario,
  definirAsociaciones
};