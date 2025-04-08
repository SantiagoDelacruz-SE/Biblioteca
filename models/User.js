// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const User = sequelize.define("User", {
//     id: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//         primaryKey: true,
//     },
//     nombre: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     correo: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//         validate: {
//             isEmail: true,
//         },
//     },
//     contrasena: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     rol_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     estado: {
//         type: DataTypes.ENUM("activo", "suspendido", "inactivo"),
//         allowNull: false,
//         defaultValue: "activo",
//     },
// }, {
//     tableName: "usuarios", 
//     timestamps: false,
// });

// module.exports = User;
