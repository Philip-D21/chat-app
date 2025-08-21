import {sequelize} from './index'



sequelize
	.sync({
		force: false,
		alter: true,
	})
	.then(() => {
		console.log('Table synced successfully')
	})
	.catch((err: Error) => {
		console.log('Unable to sync successfully: ' + err.message)
	})