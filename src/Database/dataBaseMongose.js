const mongoose = require('mongoose');
const { MONGODB_URI } = require('../keys');

// 1. Configuración de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose conectado a MongoDB en:', mongoose.connection.host);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión en Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose desconectado de MongoDB');
});

// 2. Función de conexión mejorada
const connectDB = async () => {
  try {
    // Codificar contraseña por si contiene caracteres especiales
    const encodedPassword = encodeURIComponent('0987021692@Rj');
    const connectionURI = MONGODB_URI.replace('<PASSWORD>', encodedPassword);

    await mongoose.connect(connectionURI, {
      // Estas opciones ya no son necesarias en versiones recientes de Mongoose/MongoDB Driver (4.0.0+)
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      connectTimeoutMS: 10000, // 10 segundos de timeout
      socketTimeoutMS: 45000, // 45 segundos
    });

    console.log('🚀 MongoDB conectado correctamente');
  } catch (err) {
    console.error('💥 FALLA CRÍTICA en conexión MongoDB:', err.message);
    process.exit(1); // Termina la aplicación con error
  }
};

// 3. Manejo de cierre de aplicación
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada por terminación de la app');
    process.exit(0);
  } catch (err) {
    console.error('Error al cerrar conexión MongoDB:', err);
    process.exit(1);
  }
});

// 4. Iniciar conexión inmediatamente (como solicitaste)
connectDB();

// 5. Exportar modelos (ajusta las rutas según tu estructura)

const actividadModel = require('../models/mongo/actividad');
const asistenciaModel = require('../models/mongo/asistencia');
const claseModel = require('../models/mongo/clase');
const clienteModel = require('../models/mongo/cliente');
const configuracionModel = require('../models/mongo/configuracion'); // Asumiendo que existe configuracion.js
const empleadoModel = require('../models/mongo/empleado');
const evaluacionClienteModel = require('../models/mongo/evaluacionCliente');
const fichaEntrenamientoModel = require('../models/mongo/fichaEntrenamiento');
const historialPagoModel = require('../models/mongo/historialPago'); // Asegúrate que el nombre del archivo sea correcto (historialPago.js)
const inventarioModel = require('../models/mongo/inventario');
const membresiaModel = require('../models/mongo/membresia');
const notificacionModel = require('../models/mongo/notificacion');
const pagoModel = require('../models/mongo/pago');
const productoModel = require('../models/mongo/producto');
const profesorModel = require('../models/mongo/profesor');
const reservaModel = require('../models/mongo/reserva');
const rolModel = require('../models/mongo/rol');
const rutinaModel = require('../models/mongo/rutina');
const usuarioModel = require('../models/mongo/usuario');
const ventaProductoModel = require('../models/mongo/ventaProducto');
const visitaModel = require('../models/mongo/visita');

module.exports = {
  actividadModel,
  asistenciaModel,
  claseModel,
  clienteModel,
  configuracionModel,
  empleadoModel,
  evaluacionClienteModel,
  fichaEntrenamientoModel,
  historialPagoModel,
  inventarioModel,
  membresiaModel,
  notificacionModel,
  pagoModel,
  productoModel,
  profesorModel,
  reservaModel,
  rolModel,
  rutinaModel,
  usuarioModel,
  ventaProductoModel,
  visitaModel,
};
