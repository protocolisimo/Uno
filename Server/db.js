import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// you would have to import / invoke this in another file
export async function openDb () {
  return open({
    filename: '/tmp/database.db',
    driver: sqlite3.Database
  })
}

class UserDatabase {
    async connect () {
        this.db = await openDb();
        await this.db.exec(`CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY,
            userName TEXT,
            created INTEGER
            ) STRICT`)
    }

    async insert(userName) {
        await this.db.run('INSERT INTO users (id, userName, created) VALUES (?, ?, ?) RETURNING *', [Date.now(), userName, Date.now()])
            

        return await this.get(userName);
    };

    async get(userName) {
        return await this.db.get('SELECT * FROM users WHERE users.userName = ?', userName);
    };
}

export const userDatabase = new UserDatabase();