import { Sequelize } from 'sequelize'
import * as dotenv from 'dotenv'
import  config  from '../config/index'


dotenv.config()

// const dbConfig = config

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

export default sequelize
