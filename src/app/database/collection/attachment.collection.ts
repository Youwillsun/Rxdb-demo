import { DB } from "../db.helper";
import { attachmentSchema } from '../schemas/attachment.schema';

const attachmentFun = async () => {
    const attachmentCollection = await (await DB).addCollections({ attachment: { schema: attachmentSchema } });
    return attachmentCollection.attachment;
}

export const attachmentColt = attachmentFun();