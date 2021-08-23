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
    idCard: {
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
        idCard: {
            type: 'string'
        }
    },
    // 附件
    attachments:{},
    required: ['id', 'idCard']
}

export class UserCls {
    public id: string;
    public name: string;
    public age: number;
    public gender: number;
    public idCard: string;

    constructor(name: string, age: number, gender: number, idCard: string) {
        this.id = generateSnowID();
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.idCard = idCard;
    }
}