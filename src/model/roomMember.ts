import { DataTypes, Model, Sequelize } from "sequelize";
import{ sequelize} from "./index";

class RoomMemberModel extends Model{
   public id!: string | null;
   public userId!: string | null;
   public roomId!: string | null;

}

export function initRoomMemberModel(sequelize: Sequelize){
RoomMemberModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
      userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
      roomId: {
            type: DataTypes.UUID,
            allowNull: false,
        }
    },
    {
        sequelize,
        modelName: "RoomMember",
        tableName: "room_members",
        timestamps: true
    },
)
    return RoomMemberModel;
}

export default RoomMemberModel;