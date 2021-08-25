import { RxJsonSchema } from "rxdb";
import { generateSnowID } from '../snowflake';

interface AttachmentSchema {
    id: {
        type: string,
        final: boolean
    },
    user_id: string,
    filename: string,
    filepath: string
}

export const attachmentSchema: RxJsonSchema<AttachmentSchema> = {
    title: 'attachment schema',
    version: 0,
    description: 'save attachment info',
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            final: true
        },
        user_id: {
            type: 'string'
        },
        filename: {
            type: 'string'
        },
        filepath: {
            type: 'string'
        }
    },
    required: ["id", "user_id"]
}

export class AttachmentCls {
    public id: string;
    public user_id: string;
    public filename: string;
    public filepath: string;

    constructor(user_id: string, filename: string, filepath: string) {
        this.id = generateSnowID();
        this.user_id = user_id;
        this.filename = filename;
        this.filepath = filepath;
    }
}