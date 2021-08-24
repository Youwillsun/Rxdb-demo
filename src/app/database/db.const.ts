import { APP_CONFIG } from '../../environments/environment';

let PATH: string; // 程序运行绝对路径
const DBNAME = "test"; // 数据库名称
const DBPASSWORD = "test1234"; // 数据库密码
const FILEPATH = "tcx-data/attachment/"; // 程序文件相对路径


const ENV = process.env;
// 如果是生产环境
if (APP_CONFIG.production) {
    PATH = ENV.PORTABLE_EXECUTABLE_DIR.replace(/\\/g, '/');
} else {
    PATH = ENV.INIT_CWD.replace(/\\/g, '/');
}
PATH = PATH.endsWith('/') ? PATH : PATH + '/';

export {
    PATH,
    DBNAME,
    DBPASSWORD,
    FILEPATH
}