const profesor = (sequelize, type) => {
    return sequelize.define('profesores', {
        idProfesor: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        id_profesorSql: {
            type: type.STRING,
            allowNull: true
        },
        nombre: {
            type: type.STRING,
            allowNull: false
        },
        apellido: {
            type: type.STRING,
            allowNull: false
        },
        especialidad: {
            type: type.STRING,
            allowNull: true
        },
        gmail: {
            type: type.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        telefono: {
            type: type.STRING,
            allowNull: true
        },
        horario_trabajo: {
            type: type.STRING,
            allowNull: true,
            comment: 'Horario general de trabajo'
        },
        dia: {
            type: type.STRING,
            allowNull: true,
            comment: 'Día específico de disponibilidad'
        },
        inicio: {
            type: type.STRING,
            allowNull: true,
            comment: 'Hora de inicio de disponibilidad'
        },
        fin: {
            type: type.STRING,
            allowNull: true,
            comment: 'Hora de fin de disponibilidad'
        },
        experiencia: {
            type: type.STRING,
            allowNull: true,
            comment: 'Experiencia laboral del profesor'
        },
        formacion_academica: {
            type: type.STRING,
            allowNull: true,
            comment: 'Formación académica del profesor'
        },
        stateProfesor: {
            type: type.STRING,
            allowNull: true,
            defaultValue: 'active',
            comment: 'Estado del profesor (active/inactive)'
        },
        createProfesor: {
            type: type.DATE,
            allowNull: true,
            defaultValue: type.literal('CURRENT_TIMESTAMP'),
            comment: 'Fecha de creación del registro'
        },
        updateProfesor: {
            type: type.DATE,
            allowNull: true,
            comment: 'Fecha de última actualización'
        }
    }, {
        tableName: 'profesores',
        timestamps: false,
        comment: 'Tabla unificada de Profesores que combina información personal, horarios y cualificaciones'
    });
};

module.exports = profesor;