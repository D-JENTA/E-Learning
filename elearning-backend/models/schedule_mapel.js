const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 

const ScheduleMapel = sequelize.define("ScheduleMapel", {
  id_schedule: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  day : {
    type : DataTypes.ENUM("Senin", "Selasa", "Rabu", "Kamis", "Jumat"),
    allowNull : false
  },
  jp : {
    type : DataTypes.STRING,
    allowNull : false
}, 
  id_mapel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Mapel",
      key: "id_mapel"
    }
  }
}, {
  tableName: "schedule_mapel_tb",
  timestamps: false,
  indexes: [
    { unique: true, name: "uq_schedule_mapel_day_jp", fields: ["id_mapel", "day", "jp"] }
  ]
});

module.exports = ScheduleMapel;