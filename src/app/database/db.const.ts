import { APP_CONFIG } from '../../environments/environment';

let PATH: string; // 数据库路径
const DBNAME = "test"; // 数据库名称
const DBPASSWORD = "test1234"; // 数据库密码


const ENV = process.env;
// 如果是生产环境
if (APP_CONFIG.production) {
    PATH = ENV.PORTABLE_EXECUTABLE_DIR.replace(/\\/g, '/') + '/tcx-db'
} else {
    PATH = ENV.INIT_CWD.replace(/\\/g, '/') + '/tcx-db';
}

export {
    PATH,
    DBNAME,
    DBPASSWORD
}