import { createReadStream, ReadStream, createWriteStream, WriteStream, mkdir, constants, access, rmSync } from 'fs';

class ReturnStatus {
    public status: 'success' | 'error';
    public data: any;
    public describe: any;

    constructor(status: 'success' | 'error', data: any, describe = '') {
        this.status = status;
        this.data = data;
        this.describe = describe;
    }
}

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
            reject(new ReturnStatus('error', error, '文件流创建失败'));
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
            resolve(new ReturnStatus('success', fileStream));
        });

        RFS.on('error', (error) => {
            reject(new ReturnStatus('error', error, '文件流读取操作失败'));
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
            reject(new ReturnStatus('error', error, '文件流创建/写入失败'));
        }

        WFS.on('open', () => {
            console.log('文件流写入操作已开始...');
        });

        WFS.on('finish', () => {
            console.log('文件流写入操作以完成.');
            resolve(new ReturnStatus('success', null));
        });

        WFS.on('error', (error) => {
            reject(new ReturnStatus('error', error, '文件流写入操作失败'));
        });
    });
}

/**
 * 文件拷贝
 * @param {string} source 被拷贝的文件路径(带文件名)
 * @param {string} target 要拷贝到的路径
 * @returns 返回文件拷贝状态
 */
const copyFile = (source: string, target: string) => {
    return new Promise((resolve, reject) => {
        // 检查文件是否存在
        checkFile(source).then((ch: any) => {
            if (ch.describe === '文件不存在') {
                reject(new ReturnStatus('error', null, '文件不存在'));
                return;
            }
            // 读取文件流
            readFileStream(source).then((data: any) => {
                // 写入文件流
                writeFileStream(data.data, target).then(res => {
                    resolve(new ReturnStatus('success', null));
                }).catch(err => {
                    reject(new ReturnStatus('error', err, '文件流写入失败'));
                });
            }).catch(err => {
                reject(new ReturnStatus('error', err, '文件流读取操作失败'));
            });
        }).catch(err => {
            reject(new ReturnStatus('error', err, '文件检查失败'));
        });
    })
}

/**
 * 检查文件目录并创建文件夹
 * @param path 文件夹路径
 * @returns 返回文件夹状态，当文件夹不存在是会自动创建该文件夹
 */
const checkDirectory = (path: string) => {
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
            reject(new ReturnStatus('error', error, '目录检查失败'));
        }
        if (pathStatus) {
            resolve(new ReturnStatus('success', null));
        } else {
            // 如果不存在，则创建
            mkdir(path, { recursive: true }, (err) => {
                if (err) {
                    reject(new ReturnStatus('error', '目录创建失败'));
                } else {
                    resolve(new ReturnStatus('success', null));
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
                    resolve(new ReturnStatus('success', null, '文件不存在'));
                } else {
                    resolve(new ReturnStatus('success', null, '文件已存在'));
                }
            });
        } catch (error) {
            reject(new ReturnStatus('error', error, '文件检查失败'));
        }
    });
}

/**
 * 删除文件
 * @param path 要删除的文件路径[带文件名]
 * @returns 返回删除状态
 */
const deleteFile = (path: string) => {
    return new Promise((resolve, reject) => {
        // 检查文件是否存在
        checkFile(path).then((res: any) => {
            if (res.describe === '文件已存在') {
                // 表示文件存在
                try {
                    // 删除文件
                    rmSync(path);
                    resolve(new ReturnStatus('success', null));
                } catch (error) {
                    reject(new ReturnStatus('error', error, '文件删除失败'));
                }
            } else {
                resolve(new ReturnStatus('success', null));
            }
        }).catch(err => {
            reject(new ReturnStatus('error', err, '文件检查失败'));
        });
    });
}

export {
    readFileStream,
    writeFileStream,
    copyFile,
    checkDirectory,
    checkFile,
    deleteFile
}