import { RxJsonSchema } from 'rxdb';
import { generateSnowID } from '../snowflake';

interface UserSchema {
    id: {
        type: string,
        default: string
    },
    name: string,
    age: number,
    gender: {
        type: number,
        default: number
    },
    id__card: {
        type: string,
        final: boolean
    }
}

export const userSchema: RxJsonSchema<UserSchema> = {
    title: 'user schema',
    version: 0,
    description: 'save user info',
    primaryKey: 'id',
    type: 'object',
    // 属性
    properties: {
        id: {
            type: 'string',
            final: true
        },
        name: {
            type: 'string'
        },
        age: {
            type: 'number'
        },
        gender: {
            type: 'number',
            default: 0
        },
        id__card: {
            type: 'string'
        }
    },
    // 附件
    attachments:{},
    required: ['id', 'id__card']
}

export class UserCls {
    public id: string;
    public name: string;
    public age: number;
    public gender: number;
    public id__card: string;

    constructor(name: string, age: number, gender: number, id__card: string) {
        this.id = generateSnowID();
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.id__card = id__card;
    }
}