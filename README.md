# Rxdb-Demo

**template：angular-electron**

说明：此 demo 包含对 `Rxdb` 数据库的增删改查操作，以及数据的导出与导出。

 - 依赖下载： `npm install`

 - 项目运行： `npm start`

 - 项目构建： `npm run electorn:build`

注意： 安装包不建议安装到 `C:`盘目录下，可能会有[权限问题]导致数据库锁定或数据库无法创建。

分支说明：`copy_file` - 关于附件

 - 附件直接拷贝到工程的相对目录[tcx-data/attachment]中，并在数据库中存储相对路径。

 - 附件的读取也是用相对路径进行。

 - 并且，导出的数据是不包含附件的的，所以如果是附件的转移，则需要拷贝[attachment]文件夹，将其拷贝到另一个程序下的[tcx-data/]目录下

 - 或者直接拷贝[tcx-data/attachment/]下的附件，到另一个程序下的[tcx-data/attachment/]目录下。

 - 附件只在自己上传时附带判重操作，多个用户操作数据互传时，则无任何判重操作。

**项目运行界面预览图**

![rxdb-demo-screenshoot](./src/assets/github-img/rxdb-demo-screenshoot.png)

