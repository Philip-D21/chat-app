import { DataTypes, Model, Sequelize } from "sequelize";
import {sequelize} from "./index";



class RoomModel extends Model{
   public id!: string | null;
   public name!: string;
   public isPrivate!: boolean;

}

export function initRoomModel(sequelize: Sequelize){    
RoomModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
       name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
       isPrivate: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        inviteCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        }
    },
    {
        sequelize,
        modelName: "Room",
        tableName: "rooms",
        timestamps: true
    },
)
 return RoomModel
}

export default RoomModel;