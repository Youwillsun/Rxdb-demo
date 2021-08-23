/**
 * @axihe/snowflake详情：https://www.npmjs.com/package/@axihe/snowflake
 */
let snowflake = require('@axihe/snowflake');
const config = {
    worker_id: 0, // worker_id 是 0-31的机器ID（用来配置分布式的多机器，最多支持32个机器）
    datacenter_id: 0 // datacenter_id 是 0-31的数据ID（用来配置某个机器下面的某某服务，每台机器最多支持32个服务）
}

const idWorker = new snowflake(config.worker_id, config.datacenter_id);

const generateSnowID = () => {
    //需要生成的时候，使用 `.nextId()` 方法
    return idWorker.nextId().toString();
}

/**
 * @desc 调用generateSnowID函数，返回id
 * @return 返回的是Bigint类型的ID
 * Bigint类型：https://www.axihe.com/api/js-es/ob-bigint/overview.html
 */
export { generateSnowID };