/**
 * 零依赖 JSON Schema 校验器——上游 `conformance/tests/run.js` 的 check()
 * 的保真 TS 移植。刻意只实现 vendored schemas 用到的子集：本地 $ref、
 * oneOf（恰好一个匹配）、const/enum、object（required/additionalProperties:
 * false/patternProperties）、array（min/maxItems/items/uniqueItems）、
 * string（min/maxLength/pattern/format uri|date-time）、integer（minimum）、
 * boolean。遇到子集之外的构件不静默放行——schema 更新引入新构件时这里
 * 必须显式扩展（fixtures 矩阵会当场抓住）。
 */
type JsonSchema = Record<string, unknown>;
/**
 * Validate `value` against `schema`; throws an Error with the failing path
 * (`$.a.b[0]: reason`) on the first violation.
 */
export declare function check(value: unknown, schema: JsonSchema, rootSchema?: JsonSchema, where?: string): void;
export {};
//# sourceMappingURL=schema-check.d.ts.map