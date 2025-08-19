import { Sequelize } from 'sequelize'
import * as dotenv from 'dotenv'
import config  from '../config'


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
        console.log('Database Connected successfully 🚀')
    })
    .catch((err: Error) => {
        console.log('Unable to connect successfully:', err)
    })

export default sequelize
