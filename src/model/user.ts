import { DataType, DataTypes, Model } from "sequelize";
import { v4 as uuidv4 } from "uuid"
import { UserI } from "../helpers/types"
import sequelize from "./index";

class User extends Model<UserI> {
    id!: string 
    email!: string;
    password!: string;
    lastname!: string;
    firstname!: string;
    username!: string;
  
}


User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
       username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
        },
       
    },
    {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true
    },
)