import { DataTypes, Model, Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid"
import { sequelize } from "./index";

class MessageModel extends Model{
   public id!: string | null;
   public roomId!: string;
   public senderId!: string;
   public content!: string;
   public deliveredAt!: Date | null;
   public readAt!: Date | null;

}

export function initMessageModel(sequelize: Sequelize) {    

MessageModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
      roomId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
       senderId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deliveredAt: { 
            type: DataTypes.DATE, 
            allowNull: true },
        readAt: { 
            type: DataTypes.DATE, 
            allowNull: true 
        },
    },
    {
        sequelize,
        modelName: "Message",
        tableName: "messages",
        timestamps: true
    },
)
  return MessageModel;
}

export default MessageModel;