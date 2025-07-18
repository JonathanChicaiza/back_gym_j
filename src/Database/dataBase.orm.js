const { Sequelize } = require("sequelize");
const { MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT, MYSQL_URI } = require("../keys");

let sequelize;

// Usar URI de conexión si está disponible
if (MYSQL_URI) {
    sequelize = new Sequelize(MYSQL_URI, {
        dialect: 'mysql',
        dialectOptions: {
            charset: 'utf8mb4', // Soporte para caracteres especiales
        },
        pool: {
            max: 20, // Número máximo de conexiones
            min: 5,  // Número mínimo de conexiones
            acquire: 30000, // Tiempo máximo en ms para obtener una conexión
            idle: 10000 // Tiempo máximo en ms que una conexión puede estar inactiva
        },
        logging: false // Desactiva el logging para mejorar el rendimiento
    });
} else {
    // Configuración para parámetros individuales
    sequelize = new Sequelize(MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD, {
        host: MYSQLHOST,
        port: MYSQLPORT,
        dialect: 'mysql',
        dialectOptions: {
            charset: 'utf8mb4', // Soporte para caracteres especiales
        },
        pool: {
            max: 20, // Número máximo de conexiones
            min: 5,  // Número mínimo de conexiones
            acquire: 30000, // Tiempo máximo en ms para obtener una conexión
            idle: 10000 // Tiempo máximo en ms que una conexión puede estar inactiva
        },
        logging: false // Desactiva el logging para mejorar el rendimiento
    });
}

// Autenticar y sincronizar
sequelize.authenticate()
    .then(() => {
        console.log("Conexión establecida con la base de datos");
    })
    .catch((err) => {
        console.error("No se pudo conectar a la base de datos:", err.message);
    });

// Sincronización de la base de datos
const syncOptions = process.env.NODE_ENV === 'development' ? { force: true } : { alter: true };

sequelize.sync(syncOptions)
    .then(() => {
        console.log('Base de Datos sincronizadas');
    })
    .catch((error) => {
        console.error('Error al sincronizar la Base de Datos:', error);
    });

//extracionModelos
const usuarioModel = require('../models/sql/usuario')
const rolModel = require('../models/sql/rol')
const membresiaModel = require('../models/sql/membresia')
const clienteModel = require('../models/sql/cliente')
const empleadoModel = require('../models/sql/empleado')
const profesorModel = require('../models/sql/profesor')
const pagoModel = require('../models/sql/pago')
const productoModel = require('../models/sql/producto')
const claseModel = require('../models/sql/clase')
const fichaEntrenamientoModel = require('../models/sql/fichaEntrenamiento')
const inventarioModel = require('../models/sql/inventario')
const visitaModel = require('../models/sql/visita')
const reservaModel = require('../models/sql/reserva')
const ventaProductoModel = require('../models/sql/ventaProducto')
const notificacionModel = require('../models/sql/notificacion')
const actividadModel = require('../models/sql/actividad')
const evaluacionClienteModel = require('../models/sql/evaluacionCliente')
const historialPagoModel = require('../models/sql/historialpago')
const rutinaModel = require('../models/sql/rutina')
const asistenciaModel = require('../models/sql/asistencia')



//intaciar los modelos a sincronizar
const usuario = usuarioModel(sequelize, Sequelize)
const rol = rolModel(sequelize, Sequelize)
const membresia = membresiaModel(sequelize, Sequelize)
const cliente = clienteModel(sequelize, Sequelize)
const empleado = empleadoModel(sequelize, Sequelize)
const profesor = profesorModel(sequelize, Sequelize)
const pago = pagoModel(sequelize, Sequelize)
const producto = productoModel(sequelize, Sequelize)
const clase = claseModel(sequelize, Sequelize)
const fichaEntrenamiento = fichaEntrenamientoModel(sequelize, Sequelize)
const inventario = inventarioModel(sequelize, Sequelize)
const visita = visitaModel(sequelize, Sequelize)
const reserva = reservaModel(sequelize, Sequelize)
const ventaProducto = ventaProductoModel(sequelize, Sequelize)
const notificacion = notificacionModel(sequelize, Sequelize)
const actividad = actividadModel(sequelize, Sequelize)
const evaluacionCliente = evaluacionClienteModel(sequelize, Sequelize)
const historialPago = historialPagoModel(sequelize, Sequelize)
const rutina = rutinaModel(sequelize, Sequelize)
const asistencia = asistenciaModel(sequelize, Sequelize)


//relaciones o foreingKeys
usuario.belongsTo(rol, {
  foreignKey: 'rolId',
  targetKey: 'idRol'
});
rol.hasMany(usuario, {
  foreignKey: 'rolId'
});

cliente.belongsTo(usuario, {
  foreignKey: 'idCliente',
  targetKey: 'idUsuario'
});
usuario.hasOne(cliente, {
  foreignKey: 'idCliente',
  sourceKey: 'idUsuario'
});

empleado.belongsTo(usuario, {
  foreignKey: 'idEmpleado',
  targetKey: 'idUsuario'
});
usuario.hasOne(empleado, {
  foreignKey: 'idEmpleado',
  sourceKey: 'idUsuario'
});

profesor.belongsTo(empleado, {
  foreignKey: 'idProfesor',
  targetKey: 'idEmpleado'
});
empleado.hasOne(profesor, {
  foreignKey: 'idProfesor',
  sourceKey: 'idEmpleado'
});

cliente.belongsTo(membresia, {
  foreignKey: 'membresiaId',
  targetKey: 'idMembresia'
});
membresia.hasMany(cliente, {
  foreignKey: 'membresiaId'
});

pago.belongsTo(cliente, {
  foreignKey: 'clienteId',
  targetKey: 'idCliente'
});
cliente.hasMany(pago, {
  foreignKey: 'clienteId'
});

visita.belongsTo(cliente, {
  foreignKey: 'clienteId',
  targetKey: 'idCliente'
});
cliente.hasMany(visita, {
  foreignKey: 'clienteId'
});

reserva.belongsTo(cliente, {
  foreignKey: 'clienteId',
  targetKey: 'idCliente'
});
cliente.hasMany(reserva, {
  foreignKey: 'clienteId'
});

ventaProducto.belongsTo(cliente, {
  foreignKey: 'clienteId',
  targetKey: 'idCliente'
});
cliente.hasMany(ventaProducto, {
  foreignKey: 'clienteId'
});


fichaEntrenamiento.belongsTo(cliente, {
  foreignKey: 'clienteId',
  targetKey: 'idCliente'
});
cliente.hasMany(fichaEntrenamiento, {
  foreignKey: 'clienteId'
});

evaluacionCliente.belongsTo(cliente, {
  foreignKey: 'clienteId',
  targetKey: 'idCliente'
});
cliente.hasMany(evaluacionCliente, {
  foreignKey: 'clienteId'
});

asistencia.belongsTo(cliente, {
  foreignKey: 'clienteId',
  targetKey: 'idCliente'
});
cliente.hasMany(asistencia, {
  foreignKey: 'clienteId'
});

clase.belongsTo(profesor, {
  foreignKey: 'profesorId',
  targetKey: 'idProfesor'
});
profesor.hasMany(clase, {
  foreignKey: 'profesorId'
});

fichaEntrenamiento.belongsTo(profesor, {
  foreignKey: 'profesorId',
  targetKey: 'idProfesor'
});
profesor.hasMany(fichaEntrenamiento, {
  foreignKey: 'profesorId'
});

rutina.belongsTo(profesor, {
  foreignKey: 'profesorId',
  targetKey: 'idProfesor'
});
profesor.hasMany(rutina, {
  foreignKey: 'profesorId'
});

reserva.belongsTo(clase, {
  foreignKey: 'claseId',
  targetKey: 'idClase'
});
clase.hasMany(reserva, {
  foreignKey: 'claseId'
});

evaluacionCliente.belongsTo(clase, {
  foreignKey: 'claseId',
  targetKey: 'idClase'
});
clase.hasMany(evaluacionCliente, {
  foreignKey: 'claseId'
});

asistencia.belongsTo(clase, {
  foreignKey: 'claseId',
  targetKey: 'idClase'
});
clase.hasMany(asistencia, {
  foreignKey: 'claseId'
});

historialPago.belongsTo(pago, {
  foreignKey: 'pagoId',
  targetKey: 'idPago'
});
pago.hasMany(historialPago, {
  foreignKey: 'pagoId'
});

inventario.belongsTo(producto, {
  foreignKey: 'productoId',
  targetKey: 'idProducto'
});
producto.hasMany(inventario, {
  foreignKey: 'productoId'
});

ventaProducto.belongsTo(producto, {
  foreignKey: 'productoId',
  targetKey: 'idProducto'
});
producto.hasMany(ventaProducto, {
  foreignKey: 'productoId'
});

notificacion.belongsTo(usuario, {
  foreignKey: 'usuarioId',
  targetKey: 'idUsuario'
});
usuario.hasMany(notificacion, {
  foreignKey: 'usuarioId'
});

actividad.belongsTo(usuario, {
  foreignKey: 'usuarioId',
  targetKey: 'idUsuario'
});
usuario.hasMany(actividad, {
  foreignKey: 'usuarioId'
});

// Exportar el objeto sequelize
module.exports = {
  usuario,
  rol,
  membresia,
  cliente,
  empleado,
  profesor,
  pago,
  producto,
  clase,
  fichaEntrenamiento,
  inventario,
  visita,
  reserva,
  ventaProducto,
  notificacion,
  actividad,
  evaluacionCliente,
  historialPago,
  rutina,
  asistencia
};