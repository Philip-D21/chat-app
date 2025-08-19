import { DataTypes, Model, Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid"
import { UserI } from "../helpers/types"
import{ sequelize} from "./index";

class UserModel extends Model<UserI> {
    id!: string | null;
    email!: string;
    password!: string;
    lastname!: string;
    firstname!: string;
    username!: string;
    lastSeen!: Date | null;

}

export function initUserModel(sequelize: Sequelize){
UserModel.init(
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
        lastSeen: {
            type: DataTypes.DATE, 
            allowNull: true
        }
       
    },
    {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true
    },
)
  return UserModel
}


export default UserModel;