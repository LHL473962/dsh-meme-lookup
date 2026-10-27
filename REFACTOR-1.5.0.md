# v1.5.0 重构记录（按 30 份源码笔记落地）

## 结构变化

| 之前 | 现在 | 出处 |
|---|---|---|
| 路由内联读 body | 唯一实现 `readBodyBounded(req, max)`（累加·计闸·一次解码） | wallpaper http-body |
| 只有词表加锁 | 通用 `withFileLock(file, fn)`，设置与词表都加锁 | vision-toolkit / dshmarket |
| 无版本常量 | `export const VERSION`，selftest 核对 package.json | anysearch version.js |
| 设置 set 无条件写盘 | `writeIfChanged` + 锁 | openwrite revision 思路 |

## 新测试（自检 11 项）

1. 请求体上限覆盖（枚举读 body 的站点，逐个要求上限）
2. 版本一致（VERSION 与 package.json 相等）
3. 设置写入幂等（相同内容不改写文件）

## 依旧保留的保证

- 工具不抛异常，失败返回 `{ok:false, error, hint}`
- 错误文本脱敏（路径/URL/控制字符）
- 原子写 + Windows 瞬时错误重试
- 用户词表逐条校验、字段收紧、密钥形状拒绝
- 缓存 500 条上限