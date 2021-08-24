import { RxJsonSchema } from 'rxdb';
import { generateSnowID } from '../snowflake';

interface UserSchema {
    id: {
        type: string,
        final: boolean
    },
    name: string,
    age: number,
    gender: {
        type: number,
        default: number
    },
    id_card: {
        type: string
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
        id_card: {
            type: 'string'
        }
    },
    // 附件
    attachments:{},
    required: ['id', 'id_card']
}

// user class
export class UserCls {
    public id: string;
    public name: string;
    public age: number;
    public gender: number;
    public id_card: string;

    constructor(name: string, age: number, gender: number, id_card: string) {
        this.id = generateSnowID();
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.id_card = id_card;
    }
}