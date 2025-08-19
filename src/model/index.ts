import { Sequelize } from 'sequelize'
import * as dotenv from 'dotenv'
import { DatabaseConfig } from '../helpers/types';
import RoomMemberModel, { initRoomMemberModel } from './roomMember';
import UserModel, { initUserModel } from './user';
import MessageModel, { initMessageModel } from './message';
import RoomModel, { initRoomModel } from './room';

dotenv.config()

const config: DatabaseConfig = {
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    host: process.env.DB_HOST || '',
    dialect: 'mysql',
}


const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        dialect: 'mysql',
        host: config.host,
        dialectOptions: {
            connectTimeout: 60000,
        },
    },
)


sequelize
     .authenticate()
    .then(() => {
        console.log('Database Connected successfully 🚀')
    })
    .catch((err: Error) => {
        console.log('Unable to connect successfully:', err)
    })


// Initialize models
initUserModel(sequelize);
initRoomModel(sequelize);
initMessageModel(sequelize);
initRoomMemberModel(sequelize);


//asociations
RoomMemberModel.belongsTo(UserModel, { foreignKey: 'userId' });
RoomMemberModel.belongsTo(RoomModel, { foreignKey: 'roomId' });


UserModel.hasMany(MessageModel, { foreignKey: 'senderId' });
RoomModel.hasMany(MessageModel, { foreignKey: 'roomId' });
MessageModel.belongsTo(UserModel, { foreignKey: 'senderId' });
MessageModel.belongsTo(RoomModel, { foreignKey: 'roomId' });


export {
  sequelize,
  UserModel,
  RoomModel,
  MessageModel,
  RoomMemberModel,
};