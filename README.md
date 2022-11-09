<h1 align="center">
  MeogicWhiteboard
</h1>

[中文文档](./README_cn.md)

## For developing
```shell
npm i --force
npm run dev
```
### how to add a new module
1. create a sub dir in packages
2. add that dir in [packages.js](./scripts/npm/packages.js#L14)
3. add that dir in [jest.config.js](./jest.config.js#L27),so you can write unit test.
4. add that dir in [playwright.config.js](./playwright.config.js#L19), so you can run e2e test.
5. add that dir in [build.js](./scripts/build.js#L209) order by alphabetical
### how to run test
```shell
npm run test-unit
npm run test-e2e-chromium
```
### how to publish
```shell
npm run release
```

### License

MeogicWhiteboard is [MIT licensed](https://github.com/meogic-tech/meogic-whiteboard/blob/main/LICENSE).
