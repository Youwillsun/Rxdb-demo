import { createRxDatabase, addPouchPlugin, getRxStoragePouch } from 'rxdb';
import * as leveldown from 'leveldown';
import * as pouchdbAdapterLeveldb from 'pouchdb-adapter-leveldb';
addPouchPlugin(pouchdbAdapterLeveldb);

import { DBNAME, DBPASSWORD, DBPATH } from './db.const';

const createDB = async () => {
    return await createRxDatabase({
        name: DBPATH + DBNAME,
        storage: getRxStoragePouch(leveldown),
        password: DBPASSWORD,
        multiInstance: true,
        eventReduce: false
    });
}

export const DB = createDB();