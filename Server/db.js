import { DatabaseSync } from 'node:sqlite';

const database = new DatabaseSync(':memory:');

class UserDatabase {
    constructor() {
        database.exec(`
            CREATE TABLE users(
                id INTEGER PRIMARY KEY,
                userName TEXT,
                created INTEGER
                ) STRICT
                `);
    }

    insert(userName) {
        console.log(userName)
        const query = database.prepare(`INSERT INTO users (id, userName, created) VALUES (?, ?, ?) RETURNING *`);
        query.run(Date.now(), userName, Date.now());

        return this.get(userName);

    };

    get(userName) {
        const query = database.prepare(`SELECT * FROM users WHERE users.userName = ?`);

        return query.all(userName);
    };
}


export const userDatabase = new UserDatabase();