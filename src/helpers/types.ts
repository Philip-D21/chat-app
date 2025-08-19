
export interface DatabaseConfig {
	username: string
	password: string
	database: string
	host: string
	port: number
	dialect: string
}

export interface ConfigTypes {
	development: DatabaseConfig
	production: DatabaseConfig
}


export class UserI {
    id!: string | null;
    email!: string;
    firstname!: string;
    lastname!: string;
    password!: string;
    username!: string;
	lastSeen!: Date | null;
}