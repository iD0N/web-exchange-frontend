import transformObjKeys from 'transform-obj-keys';
import { snakeCase, camelCase } from 'change-case';

export function transformApiResponse(res, transformFn) {
  return res && res.ok
    ? {
        ...res,
        data: transformFn(res.data),
      }
    : res;
}

export function toSnakeCase(obj) {
  return transformObjKeys(obj, snakeCase, { deep: true });
}

export function toCamelCase(obj) {
  return obj != null ? transformObjKeys(obj, camelCase, { deep: true }) : obj;
}
