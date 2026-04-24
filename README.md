# lite-erp-admin-web

## 介绍

一体化园区、物业、生产、仓储SaaS解决方案

**非常欢迎在相关行业业务、研发、测试、产品等各类专家反馈问题，或者提建议，争取做一个好用的行业软件**

## 功能

商铺物业 仓库租赁 物料库存 采购管理 销售管理 会员积分 线上零售 运输对接 各类收费等

## 使用场景

批发市场 工业园区 生产中心 加工中心 运输公司 物业公司等

## 开发部署

SaaS运营 独立部署 功能定制 授权开发

这个仓库是专门放置 Web 相关的源码，采用 Vue 3 + Vite 多页面开发，前段是边学边开发，代码不是那么工整，见谅

后台对应的项目为：[lite-erp-admin-application](https://gitee.com/youzi222/lite-erp-admin-application)（开源免费）

由于我们的编译服务器较弱，所以专门弄了个静态仓 [lite-erp-admin-web-dist](https://gitee.com/youzi222/lite-erp-admin-web-dist), 可以直接下载使用。

## 联系方式

生产SaaS已经在顺利运行，想体验的同学可以直接访问：[https://www.lxcbiz.cn/](https://www.lxcbiz.cn/)

我们公司提供定制服务，需要定制的话可以通过下面微信联系我，或者直接 fork 自己修改；

<img src="/help/wechat.jpg" width="200" /> <img src="/help/open.jpg" width="200" />

## 软件说明

#### 使用的组件

没什么好说的，直接去看[VUE](https://cn.vuejs.org/guide/components/v-model)、[VITE](https://vitejs.dev/)、[TDDesign](https://static.tdesign.tencent.com/?tab=api)

其实一开始是用 SPA 路由模式来处理前端写法，后面调整成这种单页面独立的方式，主要是方便多人同时修改页面避免冲突，前端我们都是业余的，一开始代码写的都很乱，经常会优化；

#### 安装

1.  npm install #安装依赖
2.  npm run dev #启动服务，注意 Url 有个/html 前缀，大家在 Nginx 转发的时候要设置一下
3.  npm run build #生成静态文件

#### 功能截图

![alt text](/help/10.png)
![alt text](/help/9.png)
![alt text](/help/1.png)
![alt text](/help/2.png)
![alt text](/help/8.png)
![alt text](/help/3.png)
![alt text](/help/4.png)
![alt text](/help/5.png)
![alt text](/help/6.png)
![alt text](/help/7.png)
