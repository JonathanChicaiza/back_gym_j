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
// Relación Usuario-Rol
usuario.belongsTo(rol);
rol.hasMany(usuario);

// Relación Usuario-Cliente
cliente.belongsTo(usuario);
usuario.hasOne(cliente);

// Relación Usuario-Empleado
empleado.belongsTo(usuario);
usuario.hasOne(empleado);

// Relación Empleado-Profesor
profesor.belongsTo(empleado);
empleado.hasOne(profesor);

// Relación Cliente-Membresía
cliente.belongsTo(membresia);
membresia.hasMany(cliente);

// Relación Cliente-Pago
pago.belongsTo(cliente);
cliente.hasMany(pago);

// Relación Cliente-Visita
visita.belongsTo(cliente);
cliente.hasMany(visita);

// Relación Cliente-Reserva
reserva.belongsTo(cliente);
cliente.hasMany(reserva);

// Relación Cliente-VentaProducto
ventaProducto.belongsTo(cliente);
cliente.hasMany(ventaProducto);

// Relación Cliente-FichaEntrenamiento
fichaEntrenamiento.belongsTo(cliente);
cliente.hasMany(fichaEntrenamiento);

// Relación Cliente-EvaluacionCliente
evaluacionCliente.belongsTo(cliente);
cliente.hasMany(evaluacionCliente);

// Relación Cliente-Asistencia
asistencia.belongsTo(cliente);
cliente.hasMany(asistencia);

// Relación Profesor-Clase
clase.belongsTo(profesor);
profesor.hasMany(clase);

// Relación Profesor-FichaEntrenamiento
fichaEntrenamiento.belongsTo(profesor);
profesor.hasMany(fichaEntrenamiento);

// Relación Clase-Reserva
reserva.belongsTo(clase);
clase.hasMany(reserva);

// Relación Clase-EvaluacionCliente
evaluacionCliente.belongsTo(clase);
clase.hasMany(evaluacionCliente);

// Relación Clase-Asistencia
asistencia.belongsTo(clase);
clase.hasMany(asistencia);

// Relación Pago-HistorialPago
historialPago.belongsTo(pago);
pago.hasMany(historialPago);

// Relación Producto-Inventario
inventario.belongsTo(producto);
producto.hasMany(inventario);

// Relación Producto-VentaProducto
ventaProducto.belongsTo(producto);
producto.hasMany(ventaProducto);

// Relación Usuario-Notificación
notificacion.belongsTo(usuario);
usuario.hasMany(notificacion);

// Relación Usuario-Actividad
actividad.belongsTo(usuario);
usuario.hasMany(actividad);

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