<h1 align="center">
  MeogicWhiteboard
</h1>

[English document](./README.md)

## 给开发者
```shell
npm i --force
npm run dev
```
### 如何添加一个新的模块
1. 在packages下新增子文件夹
2. 将那个文件夹的信息添加到[packages.js](./scripts/npm/packages.js#L14)
3. 将那个文件夹的信息添加到[jest.config.js](./jest.config.js#L27)，以便你可以进行单元测试
4. 将那个文件夹的信息添加到[playwright.config.js](./playwright.config.js#L19)，以便你可以进行端到端测试
5. 将那个文件夹的信息添加到[build.js](./scripts/build.js#L209)，根据字母排序
### 如何运行测试
```shell
npm run test-unit
npm run test-e2e-chromium
```
### 如何发布
```shell
npm run release
```

### License

MeogicWhiteboard is [MIT licensed](https://github.com/meogic-tech/meogic-whiteboard/blob/main/LICENSE).
