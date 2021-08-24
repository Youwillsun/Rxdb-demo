import { createReadStream, ReadStream, createWriteStream, WriteStream, mkdir, constants, access, lstatSync } from 'fs';
import { FILEPATH } from '../../database/db.const';

/**
 * 读取文件流
 * @param path 要读取的文件路径
 * @returns 返回文件读取状态，且成功是返回读取的文件流
 */
const readFileStream = (path: string) => {
    return new Promise((resolve, reject) => {

        let RFS: ReadStream;
        // 保存读取的文件流
        let fileStream: any;
        try {
            // 获取文件流
            RFS = createReadStream(path);
        } catch (error) {
            reject({ status: 'error', data: error });
        }

        RFS.on('open', () => {
            console.log('文件流读取操作已开始...');
        });

        RFS.on('data', (chunk) => {
            if (fileStream) fileStream += chunk;
            else fileStream = chunk;
        });

        RFS.on('end', () => {
            console.log('文件流读取操作完成.');
            resolve({ status: 'success', data: fileStream });
        });

        RFS.on('error', (error) => {
            reject({ status: 'error', data: error });
        });
    });
}

/**
 * 写入文件流
 * @param path 要写入的文件或文件路径
 * @param stream 写入的文件流
 * @returns 返回文件写入状态
 */
const writeFileStream = (stream: Buffer | DataView | string | Object, path: string) => {
    return new Promise((resolve, reject) => {
        let WFS: WriteStream;

        try {
            // 创建写入流
            WFS = createWriteStream(path);
            // 写入流
            WFS.write(stream);
            // 标记文件末尾
            WFS.end();
        } catch (error) {
            reject({ status: 'error', data: error });
        }

        WFS.on('open', () => {
            console.log('文件流写入操作已开始...');
        });

        WFS.on('finish', () => {
            console.log('文件流写入操作以完成.');
            resolve({ status: 'success', data: null });
        });

        WFS.on('error', (error) => {
            reject({ status: 'error', data: error });
        });
    });
}

/**
 * 文件拷贝
 * @param {string} source 被拷贝的文件路径(带文件名)
 * @param {string} target 要拷贝到的路径[可选]
 * @returns 返回文件拷贝状态
 */
const copyFile = (source: string, target?: string) => {

    const fileExtention = source.split('.');
    if (!target) target = FILEPATH + `temp.${fileExtention[fileExtention.length - 1]}`

    return new Promise((resolve, reject) => {
        readFileStream(source).then((data: any) => {
            console.log(data, target);
            writeFileStream(data.data, target).then(res => {
                resolve({ status: 'success', data: null });
            }).catch(err => {
                reject({ status: 'error', data: err });
            });
        }).catch(err => {
            reject({ status: 'error', data: err });
        });
    })
}

/**
 * 检查文件目录并创建文件夹
 * @param path 文件夹路径[可选]
 * @returns 返回文件夹状态，当文件夹不存在是会自动创建该文件夹
 */
const checkDirectory = (path: string = FILEPATH) => {
    return new Promise((resolve, reject) => {
        // 判断该目录是否存在
        let pathStatus: boolean;
        try {
            access(path, constants.F_OK | constants.W_OK, (err => {
                if (err) {
                    pathStatus = false;
                } else {
                    pathStatus = true;
                }
            }));
        } catch (error) {
            reject({ status: 'error', data: error });
        }
        if (pathStatus) {
            resolve({ status: 'success', data: null });
        } else {
            // 如果不存在，则创建
            mkdir(path, { recursive: true }, (err) => {
                if (err) {
                    reject({ status: 'error', data: err });
                } else {
                    resolve({ status: 'success', data: null });
                }
            });
        }
    });
}

/**
 * 检查文件是否存在
 * @param path 文件路径
 * @returns 返回文件是否存在
 */
const checkFile = (path: string) => {
    return new Promise((resolve, reject) => {
        try {
            access(path, constants.W_OK | constants.F_OK, err => {
                if (err) {
                    resolve({ status: 'success', data: null });
                } else {
                    resolve({ status: 'success', data: 'file is exit' });
                }
            });
        } catch (error) {
            reject({ status: 'error', data: error });
        }
    });
}

export {
    readFileStream,
    writeFileStream,
    copyFile,
    checkDirectory,
    checkFile
}