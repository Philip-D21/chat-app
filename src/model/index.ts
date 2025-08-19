import { Sequelize } from 'sequelize'
import * as dotenv from 'dotenv'
import { config } from '../config/index'


dotenv.config()

const dbConfig = config

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        dialect: 'mysql',
        host: dbConfig.host,
        dialectOptions: {
            connectTimeout: 60000,
        },
    },
)


sequelize
    .authenticate()
    .then(() => {
        console.log('Connection successful')
    })
    .catch((err: Error) => {
        console.log('Unable to sync successfully:', err)
    })

export default sequelize
