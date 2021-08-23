import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
// 数据库相关
import { userColt } from '../database/collection/user.collection';
import { UserCls } from '../database/schemas/user.schema';
import { DB } from '../database/db.helper';
/**
 * Electron dialog：https://www.electronjs.org/docs/api/dialog
 */
const { dialog } = require('electron').remote;
const fs = require('fs');
// node
import { Buffer } from 'buffer';

interface UserData {
  id: string;
  name: string;
  age: number;
  gender: { key: string, value: number };
  idCard: string;
  filename: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class HomeComponent implements OnInit {

  // 获取input[type=file]
  @ViewChild('iptFile') iptFile: ElementRef;

  // 存储所有用户数据
  public userData: Array<UserData> = [];
  // 插入模态框
  public insertDgDisplay = false;
  public dialogHeader = '添加数据';
  // 下拉框选项
  public dropdownOption = [{ key: '男', value: 0 }, { key: '女', value: 1 }]
  // 存储操作的用户信息
  public userInfo = {
    name: '',
    age: 0,
    gender: { key: '男', value: 0 },
    idCard: '',
    filename: ''
  }
  // 记录当前操作的数据的id
  public currentDataId: string;
  // 文件数组
  public filesArr = new FormData();
  // 文件名
  public filename: string = '';
  // 禁用按钮
  public uploadBtnDis = false;

  constructor(
    public messageService: MessageService,
    public confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.queryData();
  }

  // 查询全部数据
  async queryData() {
    (await userColt).find().exec().then(doc => {
      if (doc && doc.length) {
        this.userData = doc.map(item => {
          return {
            id: item.id,
            name: item.name ?? '',
            age: item.age ?? null,
            gender: { key: item.gender === 0 ? '男' : '女', value: item.gender },
            idCard: item.idCard ?? '',
            filename: item.allAttachments()[0]?.id ?? ''
          }
        }).reverse();
      } else {
        this.userData = [];
      }
    });
  }

  // 打开添加数据模态框
  openInsertDialog(header: string) {
    this.dialogHeader = header;
    this.insertDgDisplay = true;
    this.uploadBtnDis = false;
  }
  closeInsertDialog() {
    this.insertDgDisplay = false;
    this.userInfo = { name: '', age: 0, gender: { key: '男', value: 0 }, idCard: '', filename: '' };
  }

  // 添加数据
  async insertData() {
    // idCard为必填项
    if (!this.userInfo.idCard) {
      this.messageService.add({ severity: 'warn', summary: '警告', detail: '身份证号为必填项', life: 3000 });
      return;
    }

    let { name, age, gender, idCard } = this.userInfo;
    let data = new UserCls(name, age, gender['value'], idCard);

    try {
      // 首先查询是否有相同的idCard
      (await userColt).find().exec().then(async d => {
        let res = d.find(item => item.idCard === data['idCard']);
        if (res) {
          this.messageService.add({ severity: 'warn', summary: '警告', detail: '身份证号重复', life: 3000 });
        } else {
          //  插入数据
          (await userColt).insert(data).then(doc => {
            if (doc && Object.keys(doc).length) {

              // 插入数据
              let temp = {};
              for (const key in data) {
                if (key === 'gender') {
                  temp[key] = { key: data[key] === 0 ? '男' : '女', value: data[key] };
                  continue;
                }
                temp[key] = data[key];
              }
              // 拼接上数据库生成的id
              temp['id'] = doc.id;

              // 是否有文件判断
              if (this.filesArr.getAll('files').length) {
                // 插入文件
                for (let i = 0; i < this.filesArr.getAll('files').length; i++) {
                  doc.putAttachment({ id: this.filesArr.getAll('files')[i]['name'], data: this.filesArr.getAll('files')[i], type: this.filesArr.getAll('files')[i]['type'] }).then(res => {
                    temp['filename'] = res.id;
                  }).catch(err => {
                    this.messageService.add({ severity: 'error', summary: '失败', detail: '附件添加失败！', life: 3000 });
                  });
                }
                // 清空formData数据
                this.filesArr = new FormData();
              }

              this.userData.unshift(temp as UserData);
              // 提示
              this.messageService.add({ severity: 'success', summary: '成功', detail: '数据添加成功！', life: 3000 });

              this.closeInsertDialog();
            } else {
              this.messageService.add({ severity: 'error', summary: '失败', detail: '数据添加失败！', life: 3000 });
            }
          });
        }
      });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: '失败', detail: '未知错误-sql执行失败！', life: 3000 });
    }
  }

  // 打开修改数据模态框
  openUpdateDataDialog(params: UserData) {
    this.openInsertDialog('修改数据');
    this.currentDataId = params.id;
    this.userInfo = params;
    // 只能传一个文件
    if (params.filename) {
      this.uploadBtnDis = true;
    }
  }

  // 修改数据
  async updateData() {
    (await userColt).findOne({ selector: { 'id': this.currentDataId } }).exec().then(doc => {
      if (doc && Object.keys(doc).length) {

        let changeFunc = (oldData) => {
          oldData.name = this.userInfo.name;
          oldData.age = this.userInfo.age;
          oldData.gender = this.userInfo.gender['value'];
          oldData.idCard = this.userInfo.idCard;
          return oldData;
        }

        // 更新数据[原子更新]
        doc.atomicUpdate(changeFunc).then(res => {
          if (!(res.allAttachments()).length) {
            for (let i = 0; i < this.filesArr.getAll('files').length; i++) {
              res.putAttachment({ id: this.filesArr.getAll('files')[i]['name'], data: this.filesArr.getAll('files')[i], type: this.filesArr.getAll('files')[i]['type'] }, true).then(r => {
                this.userData.filter(item => item.id === this.currentDataId)[0]['filename'] = r.id;
              }).catch(err => {
                this.messageService.add({ severity: 'error', summary: '失败', detail: '附件添加失败！', life: 3000 });
              });
            }
            this.filesArr = new FormData();
          }
          this.closeInsertDialog();
        }).catch(err => {
          this.messageService.add({ severity: 'error', summary: '失败', detail: '数据修改失败', life: 3000 });
        });

        this.messageService.add({ severity: 'success', summary: '成功', detail: '数据修改成功', life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: '失败', detail: '该数据不存在', life: 3000 });
      }

    });
  }

  // 删除数据
  deleteData(event: Event, params: UserData) {
    this.confirmationService.confirm({
      target: event.target,
      message: '您确定要删除这条数据吗?',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        (await userColt).findOne({ selector: { 'id': params.id } }).exec().then(doc => {
          if (doc && Object.keys(doc).length) {

            doc.remove(); // 移除数据

            this.userData = this.userData.filter(item => item.id !== params.id);

            this.messageService.add({ severity: 'success', summary: '成功', detail: '数据删除成功！', life: 3000 });
          } else {
            this.messageService.add({ severity: 'error', summary: '失败', detail: '数据删除失败！', life: 3000 })
          }
        })
      }
    });
  }

  // 清空数据
  removeAllData(event: Event) {
    this.confirmationService.confirm({
      target: event.target,
      message: '您确定要清空数据吗?',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        // 目前暂时一行一行删除
        (await userColt).find().exec().then(doc => {
          doc.forEach(item => {
            item.remove();
          });
          this.userData = [];
          this.messageService.add({ severity: 'success', summary: '成功', detail: '数据已清空！', life: 3000 });
        }).catch(err => {
          this.messageService.add({ severity: 'success', summary: '成功', detail: `数据清空失败:${err}`, life: 3000 });
        });
      }
    });
  }

  // 导入数据
  importJsonFun() {
    dialog.showOpenDialog({ title: '请选择文件', buttonLabel: '确定', filters: [{ name: 'JSON Files', extensions: ['json'] }], properties: ['showHiddenFiles', 'openFile'] }).then(async (path: { canceled: boolean, filePaths: Array<string> }) => {
      // 如果用户选择了文件
      if (!path.canceled) {
        // 读取文件
        try {
          const data = fs.readFileSync(path.filePaths[0], 'utf8');
          (await DB).importJSON(JSON.parse(data)).then(() => {
            this.messageService.add({ severity: 'success', summary: '成功', detail: `数据导入成功`, life: 3000 });
            // 调用查询
            this.queryData();
          }).catch(error => {
            this.messageService.add({ severity: 'error', summary: '失败', detail: `数据导入失败：${error}`, life: 3000 });
          });
        } catch (err) {
          this.messageService.add({ severity: 'error', summary: '失败', detail: `数据读取错误：${err}`, life: 3000 });
        }
      }
    });
  }

  // 导出数据到指定文件
  exportJsonFun() {
    dialog.showSaveDialog({ title: '请选择文件导出位置', defaultPath: `export-${new Date().getTime()}`, buttonLabel: '确定', filters: [{ name: 'JSON Files', extensions: ['json'] }], properties: ['showHiddenFiles'] }).then(async (path: { canceled: boolean, filePath?: string }) => {
      // 如果用户选择了文件路径
      if (!path.canceled) {
        (await DB).exportJSON(true).then(json => {
          const choosePath = (path.filePath).replace(/\\/g, '/');
          // 写入文件
          try {
            fs.writeFileSync(choosePath, JSON.stringify(json));
            this.messageService.add({ severity: 'success', summary: '成功', detail: `数据导出成功`, life: 3000 });
          } catch (error) {
            this.messageService.add({ severity: 'error', summary: '失败', detail: `数据写入错误：${error}`, life: 3000 });
          }
          // child_process.exec(`echo ${JSON.stringify(json)} > ${choosePath}`);
        }).catch(err => {
          this.messageService.add({ severity: 'error', summary: '失败', detail: `数据导出错误：${err}`, life: 3000 });
        });
      }
    });
  }

  // 文件上传
  uploadFiles() {
    this.iptFile.nativeElement.click();
    this.iptFile.nativeElement.onchange = (e: any) => {
      let file = e.target.files[0]; // 取得一个文件
      let type = file?.type; // 文件类型
      if (type) {
        this.filesArr.append('files', file);
        this.userInfo.filename = file.name;
      } else {
        this.messageService.add({ severity: 'warn', summary: '警告', detail: '请选择正确的文件类型！', life: 3000 });
      }
    }
  }

  // 文件下载
  async downloadFile(params: UserData) {
    let that = this;
    (await userColt).findOne({ selector: { id: params.id } }).exec().then(doc => {
      if (!(doc.allAttachments()).length) {
        this.messageService.add({ severity: 'warn', summary: '警告', detail: '文件不存在' });
        return;
      }
      doc.getAttachment(params.filename).getData().then(res => {

        // 选择下载位置
        dialog.showSaveDialog({ title: '请选择文件下载位置', defaultPath: params.filename, buttonLabel: '确定' }).then(path => {
          if (!path.canceled) {
            // 创建FileReader对象
            const readFile = new FileReader();

            readFile.onload = function (e) {
              const choosePath = (path.filePath).replace(/\\/g, '/');
              // 将ArrayBuffer转换为buffer
              const buffer = Buffer.from(e.target.result as ArrayBuffer);
              // 创建一个可写流
              const ws = fs.createWriteStream(choosePath);
              try {
                ws.once('open', function () {
                  console.log('流文件已打开，buffer写入中...');
                });
                ws.once('close', () => {
                  console.log('流文件已关闭，buffer写入完成');
                });
                // 将文件内容(buffer)写入文件
                ws.write(buffer);
                ws.end();
              } catch (error) {
                that.messageService.add({ severity: 'error', summary: '失败', detail: '文件下载失败！' + error, life: 3000 });
                return;
              }
              that.messageService.add({ severity: 'success', summary: '成功', detail: '文件下载成功！', life: 3000 });
            }

            // 读取文件内容
            readFile.readAsArrayBuffer(res);
          }
        });
      });
    }).catch(err => {
      this.messageService.add({ severity: 'error', summary: '错误', detail: '该数据不存在' });
    });
  }

}
