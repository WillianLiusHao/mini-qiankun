export const deepClone = (obj: any) => {
  // 过滤基础数据类型和 null
  if (typeof obj !== "object" || obj === null) return;
  // 复杂数据类型：特殊处理 RegExp Date Array
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)
  let ret: any = obj instanceof Array ? [] : {};
  for (let k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      ret[k] = typeof obj[k] === "object" ? deepClone(obj[k]) : obj[k];
    }
  }
  return ret;
}
