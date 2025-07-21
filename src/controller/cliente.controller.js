const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');
const { cifrarDatos, descifrarDatos } = require('../lib/encrypDates');

// Función auxiliar para descifrar datos de forma segura
function safeDecrypt(data) {
    try {
        return descifrarDatos(data);
    } catch (error) {
        console.error('Error al descifrar datos:', error.message);
        return data; // Devolver el dato original si no se puede descifrar
    }
}

const clienteCtl = {};

// Obtener todos los clientes
clienteCtl.obtenerClientes = async (req, res) => {
    try {
        const [listaClientes] = await sql.promise().query(`
SELECT * FROM clientes
 `);

        const clientesCompletos = await Promise.all(
            listaClientes.map(async (cliente) => {
                const clienteMongo = await mongo.Cliente.findOne({
                    id_clienteSql: cliente.idCliente // Corrected to id_clienteSql based on your Mongo model
                });

                // Descifrar datos sensibles del cliente SQL
                const clienteDescifrado = {
                    ...cliente,
                    // Assuming 'nombreCliente' and 'email' exist in your SQL table based on usage in create/update
                    nombreCliente: safeDecrypt(cliente.nombreCliente),
                    email: safeDecrypt(cliente.email),
                    telefono: safeDecrypt(cliente.telefono),
                    direccion: safeDecrypt(cliente.direccion)
                };

                return {
                    ...clienteDescifrado,
                    detallesMongo: clienteMongo
                };
            })
        );
        res.flash('success', 'Clientes obtenidos exitosamente');
        return res.apiResponse(clientesCompletos, 200, 'Clientes obtenidos exitosamente');
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.flash('error', 'Error al obtener clientes');
        return res.apiError('Error interno del servidor', 500);
    }
};

// Obtener un cliente por ID
clienteCtl.obtenerCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const [cliente] = await sql.promise().query(`
 SELECT * FROM clientes WHERE idCliente = ?
`, [id]);

        if (cliente.length === 0) {
            res.flash('error', 'Cliente no encontrado');
            return res.apiError('Cliente no encontrado', 404);
        }

        const clienteMongo = await mongo.Cliente.findOne({
            id_clienteSql: parseInt(id) // Corrected to id_clienteSql
        });

        // Descifrar datos sensibles del cliente SQL
        const clienteDescifrado = {
            ...cliente[0],
            nombreCliente: safeDecrypt(cliente[0].nombreCliente),
            email: safeDecrypt(cliente[0].email),
            telefono: safeDecrypt(cliente[0].telefono),
            direccion: safeDecrypt(cliente[0].direccion)
        };

        const clienteCompleto = {
            ...clienteDescifrado,
            detallesMongo: clienteMongo
        };
        res.flash('success', 'Cliente obtenido exitosamente');
        return res.apiResponse(clienteCompleto, 200, 'Cliente obtenido exitosamente');
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.flash('error', 'Error al obtener cliente');
        return res.apiError('Error interno del servidor', 500);
    }
};

// Crear nuevo cliente
clienteCtl.crearCliente = async (req, res) => {
    try {
        const { nombreCliente, email, telefono, direccion, fecha_nacimiento, genero, preferencia, historial_compras } = req.body;

        // Validar campos requeridos antes de cifrar
        if (!nombreCliente || !email || !telefono || !direccion) {
            res.flash('error', 'Faltan campos requeridos para crear el cliente SQL.');
            return res.apiError('Faltan campos requeridos para crear el cliente SQL.', 400);
        }

        // Crear en SQL (cifrar datos sensibles)
        const datosSql = {
            nombreCliente: cifrarDatos(nombreCliente),
            email: cifrarDatos(email),
            telefono: cifrarDatos(telefono),
            direccion: cifrarDatos(direccion),
            stateCliente: 'activo', // Changed from 'estado' to 'stateCliente' based on SQL model
            createCliente: new Date().toLocaleString()
        };

        const nuevoCliente = await orm.cliente.create(datosSql);
        const idCliente = nuevoCliente.idCliente;

        // Crear en MongoDB
        const datosMongo = {
            id_clienteSql: idCliente, // Corrected to id_clienteSql
            fecha_nacimiento: fecha_nacimiento || '',
            genero: genero || 'No especificado',
            preferencia: preferencia || '',
            ultimo_acceso: new Date().toLocaleString(),
            historial_compras: historial_compras || ''
        };

        await mongo.Cliente.create(datosMongo);

        res.flash('success', 'Cliente creado exitosamente');
        return res.apiResponse(
            { idCliente },
            201,
            'Cliente creado exitosamente'
        );
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.flash('error', 'Error al crear el cliente');
        return res.apiError('Error al crear el cliente', 500);
    }
};

// Actualizar cliente
clienteCtl.actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreCliente, email, telefono, direccion, fecha_nacimiento, genero, preferencia, historial_compras } = req.body;

        // Verificar existencia en SQL
        const [clienteExistente] = await sql.promise().query(`
     SELECT * FROM clientes WHERE idCliente = ?
    `, [id]);

        if (clienteExistente.length === 0) {
            res.flash('error', 'Cliente no encontrado');
            return res.apiError('Cliente no encontrado', 404);
        }

        // Actualizar en SQL (cifrar datos sensibles si se proporcionan)
        const datosActualizacion = {
            nombreCliente: nombreCliente ? cifrarDatos(nombreCliente) : clienteExistente[0].nombreCliente,
            email: email ? cifrarDatos(email) : clienteExistente[0].email,
            telefono: telefono ? cifrarDatos(telefono) : clienteExistente[0].telefono,
            direccion: direccion ? cifrarDatos(direccion) : clienteExistente[0].direccion,
            updateCliente: new Date().toLocaleString()
        };

        await orm.cliente.update(datosActualizacion, {
            where: { idCliente: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {
            ultimo_acceso: new Date().toLocaleString()
        };

        if (fecha_nacimiento !== undefined) datosMongoActualizacion.fecha_nacimiento = fecha_nacimiento;
        if (genero !== undefined) datosMongoActualizacion.genero = genero;
        if (preferencia !== undefined) datosMongoActualizacion.preferencia = preferencia;
        if (historial_compras !== undefined) datosMongoActualizacion.historial_compras = historial_compras;

        await mongo.Cliente.findOneAndUpdate(
            { id_clienteSql: parseInt(id) }, // Corrected to id_clienteSql
            datosMongoActualizacion
        );

        res.flash('success', 'Cliente actualizado exitosamente');
        return res.apiResponse(
            { idCliente: id },
            200,
            'Cliente actualizado exitosamente'
        );
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.flash('error', 'Error al actualizar el cliente');
        return res.apiError('Error al actualizar el cliente', 500);
    }
};

// Eliminar cliente
clienteCtl.eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar existencia en SQL
        const [clienteExistente] = await sql.promise().query(`
 SELECT * FROM clientes WHERE idCliente = ?
`, [id]);

        if (clienteExistente.length === 0) {
            res.flash('error', 'Cliente no encontrado');
            return res.apiError('Cliente no encontrado', 404);
        }

        // Eliminar en SQL
        await orm.cliente.destroy({
            where: { idCliente: id }
        });

        // Eliminar en MongoDB
        await mongo.Cliente.findOneAndDelete({ id_clienteSql: parseInt(id) }); // Corrected to id_clienteSql

        res.flash('success', 'Cliente eliminado exitosamente');
        return res.apiResponse(
            null,
            200,
            'Cliente eliminado exitosamente'
        );
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.flash('error', 'Error al eliminar el cliente');
        return res.apiError('Error al eliminar el cliente', 500);
    }
};

module.exports = clienteCtl;