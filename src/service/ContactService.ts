
// import { CouchbaseLite } from '@ionic-native/couchbase-lite';
// import axios from "axios";

import {SQLite, SQLiteObject} from '@ionic-native/sqlite';

class ContactService {
    static db: SQLiteObject

    async open(): Promise<SQLiteObject> {
        if (!ContactService.db) {
            ContactService.db = await SQLite.create({
                name: 'sqlite.db',
                location: 'default'
            });

            await this.init();
        }

        return ContactService.db;
    }

    async init() {
        const db: SQLiteObject = await this.open();

        await db.executeSql(`create table if not exists contacts(id INTEGER PRIMARY KEY, contact TEXT)`, []);
    }

    async insert(data: Record<string, any>) {
        const db: SQLiteObject = await this.open();
        return await db.executeSql("insert into contacts(contact) values (?)", [JSON.stringify(data)])
    }

    async update(id: bigint, data: Record<string, any>) {
        const db: SQLiteObject = await this.open();
        return await db.executeSql("update contacts set contact = ? where id = ?", [JSON.stringify(data), id])
    }

    async delete(id: bigint) {
        const db: SQLiteObject = await this.open();
        return await db.executeSql("delete from contacts where id = ?", [id])
    }

    async get(id: bigint): Promise<Record<string, any>> {
        const db: SQLiteObject = await this.open();

        const resultSet = await db.executeSql("select contact from contacts where id = ?", [id]);
        return JSON.parse(resultSet.rows.item(0).contact);
    }

    async list(): Promise<Array<Record<string, any>>> {
        const db: SQLiteObject = await this.open();
        const resultSet = await db.executeSql("select id, contact from contacts", [])

        let results = [];
        for (let i = 0; i < resultSet.rows.length; i ++) {
            results.push(resultSet.rows.item(i));
        }

        results = results.map(v => { const contact = JSON.parse(v.contact); contact._id = v.id; return contact });
        return results;
    }
}


export default ContactService;

/*

let rd = Math.floor(Math.random() * 10000) + 1;

export default {
    db: null,
    async add(data: Record<string, any>) {
        data.id = rd;
        localStorage.setItem('cnt_' + rd, JSON.stringify(data));
        return rd ++;
    },

    async get(id: string) {
        // await db.executeSql();
    },

    async delete(id: bigint) {
        return localStorage.removeItem('cnt_' + id)
    }
}

class ContactService {
    static db: SQLiteObject

    constructor() {
    }

    async open(): Promise<SQLiteObject> {
        if (!ContactService.db) {
            ContactService.db = await SQLite.create({
                name: 'contact.db',
                location: 'default'
            });

            await this.init();
        }

        return ContactService.db;
    }

    async init() {
        const db: SQLiteObject = await this.open();

        await db.executeSql(`create table if not exists contacts(
                                                      id INTEGER PRIMARY KEY,
                                                      firstName VARCHAR(100),
                                                      lastName VARCHAR(100),
                                                      image TEXT,
                                                      company VARCHAR(100),
                                                      title VARCHAR(100),
                                                      notes TEXT

                             )`, []);
        await db.executeSql('create table if not exists contact_fields(id INTEGER PRIMARY KEY, contactId INTEGER, field VARCHAR(5), type VARCHAR(25), value TEXT)', []);
    }

    async add(data: Record<string, any>) {
        const db: SQLiteObject = await this.open();

        if (data['id']) {
            return await this.update(data);
        }

        return await db.transaction(tx => {
            tx.executeSql("insert into contacts(firstName, lastName, image, company, title, notes) values (?, ?, ?, ?, ?, ?)", [data['firstName'], data['lastName'], data['image'], data['company'], data['title'], data['notes']], (result: any) => {
                const contactId = result.insertId;

                const fields: Array<any> = [];
                data['numbers'].forEach((v: Record<string, any>) => fields.push([contactId, 'NUMB', v['type'], v['value']]));
                data['emails'].forEach((v: Record<string, any>) => fields.push([contactId, 'EMAIL', v['type'], v['value']]));
                data['addresses'].forEach((v: Record<string, any>) => fields.push([contactId, 'ADDR', v['type'], v['value']]));
                data['websites'].forEach((v: Record<string, any>) => fields.push([contactId, 'WEB', v['type'], v['value']]));
                fields.forEach(v => {
                    tx.executeSql('insert into contact_fields(contactId, field, type, value) values (?, ?, ?, ?)', v)
                });
            });
        });
    }

    async update(data: Record<string, any>) {
        const db: SQLiteObject = await this.open();
        const old = await this.get(data['id']);

        return await db.transaction(tx => {
            tx.executeSql("update contacts set firstName = ?, lastName = ?, image = ?, company = ?, title = ?, notes = ?", [data['firstName'], data['lastName'], data['image'], data['company'], data['title'], data['notes']], (result: any) => {
                const contactId = old.id;

                // insert
                // update

                const fields: Array<any> = [];
                data['numbers'].forEach((v: Record<string, any>) => fields.push([contactId, 'NUMB', v['type'], v['value']]));
                data['emails'].forEach((v: Record<string, any>) => fields.push([contactId, 'EMAIL', v['type'], v['value']]));
                data['addresses'].forEach((v: Record<string, any>) => fields.push([contactId, 'ADDR', v['type'], v['value']]));
                data['websites'].forEach((v: Record<string, any>) => fields.push([contactId, 'WEB', v['type'], v['value']]));
                fields.forEach(v => {
                    tx.executeSql('insert into contact_fields(contactId, field, type, value) values (?, ?, ?, ?)', v)
                });
            });
        });
    }

    async get(id: bigint): Promise<Record<string, any>> {
        const db: SQLiteObject = await this.open();

        await db.executeSql("")
        return {};
    }
}
*/
