import { DB } from '../db.helper';
import { userSchema } from '../schemas/user.schema';

const userFun = async () => {
    const userCollection = await (await DB).addCollections({ user: { schema: userSchema } });
    return userCollection.user;
}

export const userColt = userFun();