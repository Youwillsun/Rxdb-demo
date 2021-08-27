import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
// 数据库相关
import { userColt } from '../database/collection/user.collection';
import { UserCls } from '../database/schemas/user.schema';
import { DB } from '../database/db.helper';
/**
 * Electron dialog：https://www.electronjs.org/docs/api/dialog
 */
const { dialog } = require('electron').remote;
// node
const fs = require('fs');
// 文件处理工具
import { copyFile, readFileStream } from '../shared/utils/file_handler';
// excel 模板
import { userInfoTemplate_path } from '../shared/static.const';

const XLSX = require('xlsx');

interface UserData {
  id: string;
  name: string;
  age: number;
  gender: { key: string, value: number };
  id_card: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class HomeComponent implements OnInit {

  // 存储所有用户数据
  public userData: Array<UserData> = [];
  // 插入模态框
  public userInfoDgDisplay = false;
  public dialogHeader = '添加数据';
  // 下拉框选项
  public dropdownOption = [{ key: '男', value: 0 }, { key: '女', value: 1 }]
  // 存储操作的用户信息
  public userInfo = {
    name: '',
    age: 0,
    gender: { key: '男', value: 0 },
    id_card: ''
  }
  // 记录当前操作的数据的id
  public currentDataId: string;

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
            id_card: item.id_card ?? ''
          }
        }).reverse();
      } else {
        this.userData = [];
      }
    });
  }

  // 打开模态框
  openInsertDialog(header: string) {
    this.dialogHeader = header;
    this.userInfoDgDisplay = true;
  }

  // 关闭模态框
  closeInsertDialog() {
    this.userInfoDgDisplay = false;
    this.userInfo = { name: '', age: 0, gender: { key: '男', value: 0 }, id_card: '' };
  }

  // 添加数据
  async insertData() {
    // id_card为必填项
    if (!this.userInfo.id_card) {
      this.messageService.add({ severity: 'warn', summary: '警告', detail: '身份证号为必填项', life: 3000 });
      return;
    }

    let { name, age, gender, id_card } = this.userInfo;
    let data = new UserCls(name, age, gender['value'], id_card);

    try {
      // 首先查询是否有相同的id_card
      (await userColt).find().exec().then(async d => {
        let res = d.find(item => item.id_card === data['id_card']);
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
  }

  // 修改数据
  async updateData() {
    (await userColt).findOne({ selector: { 'id': this.currentDataId } }).exec().then(doc => {
      if (doc && Object.keys(doc).length) {

        let changeFunc = (oldData) => {
          oldData.name = this.userInfo.name;
          oldData.age = this.userInfo.age;
          oldData.gender = this.userInfo.gender['value'];
          oldData.id_card = this.userInfo.id_card;
          return oldData;
        }

        // 更新数据[原子更新]
        doc.atomicUpdate(changeFunc).then(res => {
          this.messageService.add({ severity: 'success', summary: '成功', detail: '数据修改成功', life: 3000 });
          this.closeInsertDialog();
        }).catch(err => {
          this.messageService.add({ severity: 'error', summary: '失败', detail: '数据修改失败', life: 3000 });
        });
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
        }).catch(err => {
          this.messageService.add({ severity: 'error', summary: '失败', detail: `数据导出错误：${err}`, life: 3000 });
        });
      }
    });
  }

  // 下载userInfoTemplate模板文件
  downloadTemplateFile() {
    dialog.showSaveDialog({ title: '请选择模板下载位置', defaultPath: '用户信息模板.xlsx', properties: ['showHiddenFiles'] }).then((path: { canceled: boolean, filePath?: string }) => {
      if (!path.canceled) {
        copyFile(userInfoTemplate_path, path.filePath).then(res => {
          this.messageService.add({ severity: 'success', summary: '成功', detail: '用户信息模板文件下载成功' });
        }).catch(err => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: `文件下载出错：${err.detail ?? err}` });
        })
      }
    });
  }

  // 解析excel模板
  parseExcel() {
    dialog.showOpenDialog({ title: '请选择要解析的模板', filters: [{ name: 'excel', extensions: ['xlsx', 'xls'] }], properties: ['openFile'] }).then((path: { canceled: Boolean, filePaths: Array<string> }) => {
      if (!path.canceled) {
        const choosePath = path.filePaths[0];
        readFileStream(choosePath).then(async (res: any) => {
          const wb = XLSX.read(res.data, { type: 'buffer' });
          let excelData: Array<any> = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          excelData.shift();
          // 将 id_card 转换为 字符串
          excelData = excelData.map(item => {
            item.id_card = String(item.id_card);
            return item;
          })
          this.bulkInsertData(excelData)
        });
      }
    });
  }

  // 数据库批量插入数据
  bulkInsertData(excelData: Array<{ name: string, age: number, gender: string, id_card: string }>) {
    // 首先判断excelData中的身份证号是否重复 在判断与数据库中存在的数据是否重复
    let idCardArr = excelData.map(item => item.id_card);
    // 获取到其中重复的数据
    let repeatingIdCard = Array.from(new Set(idCardArr.filter(item => idCardArr.indexOf(item) !== idCardArr.lastIndexOf(item))));
    if (repeatingIdCard.length) {
      // 如果重复就进行提示
      this.confirmationService.confirm({
        message: `身份证号：${repeatingIdCard.join(' , ')} 重复.`,
        header: '请检查！',
        icon: 'pi pi-exclamation-triangle',
        key: "confirmDialog"
      });
      return;
    } else {
      // 查找数据
      const FindOne = (id_card: string) => {
        return new Promise(async (resolve, reject) => {
          (await userColt).findOne({ selector: { id_card: id_card } }).exec().then(res => {
            if (res) {
              reject({ status: 'error', data: id_card });
            } else {
              resolve({ status: 'success', data: null });
            }
          }).catch(err => {
            reject({ status: 'error', data: id_card });
          });
        });
      }

      // 检查数据是否和数据库中的数据重复
      const chekcRepeatingData = () => {
        return new Promise(async (resolve, reject) => {
          // 获取到不重复的数据
          let noRepeatingIdCard = Array.from(new Set(idCardArr));
          for (let i = 0; i < noRepeatingIdCard.length; i++) {
            // 查询
            try {
              let data: any = await FindOne(noRepeatingIdCard[i]);
              if (data.data) {
                reject({ status: 'error', data: data.data });
                return;
              }
            } catch (error) {
              reject({ status: 'error', data: noRepeatingIdCard[i] });
            }
            break;
          }
          // 所有数据都不重复，就返回成功
          resolve({ status: 'success', data: null });
        })
      };

      chekcRepeatingData().then(async p => {
        // 向数据库中插入数据
        let arr = excelData.map(item => {
          return new UserCls(item.name, item.age, item.gender === '男' ? 0 : 1, item.id_card);
        });

        (await userColt).bulkInsert(arr).then(async res => {
          if (res.error.length === 0) {
            this.queryData();
            this.messageService.add({ severity: 'success', summary: '成功', detail: '模板数据插入成功' });
          } else {
            // 把插入成功的数据全部删除
            let idArr = res.success.map(item => {
              return item.get('id');
            });
            // 将插入的数据全部抹除
            (await userColt).bulkRemove(idArr).then(d => {
              this.messageService.add({ severity: 'error', summary: '错误', detail: '模板数据插入失败' });
            });
          }
        }).catch(err => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '模板数据插入失败：' + err });
        });
      }).catch(err => {
        // 如果数据库总存在身份证号为 item 的数据
        this.messageService.add({ severity: 'warn', summary: '导入错误，身份证号重复', detail: `身份证号：${err.data} 已存在，请处理！` });
      });
    }
  }


}
