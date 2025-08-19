import { DataTypes, Model } from "sequelize";
import { v4 as uuidv4 } from "uuid"
import sequelize from "./index";

class MessageModel extends Model{
   public id!: string | null;
   public roomId!: string;
   public senderId!: string;
   public content!: string;

}

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
        }
    },
    {
        sequelize,
        modelName: "Message",
        tableName: "messages",
        timestamps: true
    },
)


export default MessageModel;