// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged

import type { AxiosResponse } from 'axios';
import type { RequestOptions, Result } from './types';
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform';

import { VAxios } from './Axios';
import { checkStatus } from './checkStatus';

import { useGlobSetting } from '/@/hooks/setting';
import { useMessage } from '/@/hooks/web/useMessage';

import { RequestEnum, ResultEnum, ContentTypeEnum } from '/@/enums/httpEnum';

import { isString } from '/@/utils/is';
import { setObjToUrlParams, deepMerge } from '/@/utils';
import { errorStore } from '/@/store/modules/error';
import { errorResult } from './const';
import { useI18n } from '/@/hooks/web/useI18n';
import { createNow, formatRequestDate } from './helper';
import { Base64 } from 'js-base64';
import { userStore } from '/@/store/modules/user';

const globSetting = useGlobSetting();
const prefix = globSetting.urlPrefix;
const { createMessage, createErrorModal } = useMessage();

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * 如果需要转换请求(isTransformRequestResult)结果,
   * 则对返回值进行转换
   * @description: 处理请求数据
   */
  transformRequestHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const { t } = useI18n();
    const { isTransformRequestResult } = options;
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformRequestResult) {
      return res.data;
    }

    // 错误的时候返回
    const resData = res.data;
    if (!resData) {
      // return '[HTTP] Request has no return value';
      return errorResult;
    }
    //  这里 code，data，msg为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    const { code, data, msg } = resData;

    // 这里逻辑可以根据项目进行修改
    const hasSuccess = resData && Reflect.has(resData, 'code') && code === ResultEnum.SUCCESS;
    if (!hasSuccess) {
      if (msg) {
        // errorMessageMode=‘modal’的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
        if (options.errorMessageMode === 'modal') {
          createErrorModal({ title: t('sys.api.errorTip'), content: msg });
        } else if (options.errorMessageMode === 'message') {
          createMessage.error(msg);
        }
      }
      Promise.reject(new Error(msg));
      return errorResult;
    }

    // 接口请求成功，直接返回结果
    if (code === ResultEnum.SUCCESS) {
      return data;
    }
    // 接口请求错误，统一提示错误信息
    if (code === ResultEnum.ERROR) {
      if (msg) {
        createMessage.error(msg);
        Promise.reject(new Error(msg));
      } else {
        const errorMessage = t('sys.api.errorMessage');
        createMessage.error(errorMessage);
        Promise.reject(new Error(errorMessage));
      }
      return errorResult;
    }
    // 登录超时
    if (code === ResultEnum.TIMEOUT) {
      const timeoutMsg = t('sys.api.timeoutMessage');
      createErrorModal({
        title: t('sys.api.operationFailed'),
        content: timeoutMsg,
      });
      Promise.reject(new Error(timeoutMsg));
      return errorResult;
    }
    return errorResult;
  },

  /**
   * 请求之前处理config
   * @param config 配置
   * @param options 操作
   */
  beforeRequestHook: (config, options) => {
    // 全局api前缀， 局部url前缀， 是否将参数拼接到url中， 是否格式化日期， 是否在url后面拼接时间戳
    const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true } = options;

    if (joinPrefix) {
      config.url = `${prefix}${config.url}`;
    }

    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`;
    }
    const params = config.params || {};
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, createNow(joinTime, false));
      } else {
        // 兼容restful风格
        config.url = config.url + params + `${createNow(joinTime, true)}`;
        config.params = undefined;
      }
    } else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params);
        config.data = params;
        config.params = undefined;
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(config.url as string, config.data);
        }
      } else {
        // 兼容restful风格
        config.url = config.url + params;
        config.params = undefined;
      }
    }
    return config;
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config) => {
    const tokenName = 'token';
    const { multiTenantType, clientId, clientSecret } = globSetting;

    // 增加token
    const isToken = config.headers['x-is-token'] === false ? config.headers['x-is-token'] : true;

    const token = userStore.getTokenState;
    if (isToken && token) {
      config.headers[tokenName] = 'Bearer ' + token;
    }

    // 增加租户编码
    const isTenant = config.headers['x-is-tenant'] === false ? config.headers['x-is-tenant'] : true;
    if (isTenant && multiTenantType !== 'NONE') {
      config.headers.tenant = userStore.getTenantState;
    }

    // 添加客户端信息
    config.headers['Authorization'] = `Basic ${Base64.encode(`${clientId}:${clientSecret}`)}`;

    return config;
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    debugger;
    const { t } = useI18n();
    errorStore.setupErrorHandle(error);
    const { response, code, message } = error || {};
    const msg: string = response?.data?.msg ?? '';
    const err: string = error?.toString?.() ?? '';
    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        createMessage.error(t('sys.api.apiTimeoutMessage'));
      }
      if (err?.includes('Network Error')) {
        createErrorModal({
          title: t('sys.api.networkException'),
          content: t('sys.api.networkExceptionMsg'),
        });
      }
    } catch (error) {
      throw new Error(error);
    }
    checkStatus(error?.response?.status, msg);
    return Promise.reject(error);
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    deepMerge(
      {
        timeout: 30 * 1000,
        // 基础接口地址
        // baseURL: globSetting.apiUrl,
        // 接口可能会有通用的地址部分，可以统一抽取出来
        prefixUrl: prefix,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: true,
          // 需要对返回数据进行处理
          isTransformRequestResult: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 消息提示类型
          errorMessageMode: 'message',
          // 接口地址
          apiUrl: globSetting.apiUrl,
          //  是否加入时间戳
          joinTime: true,
          // 忽略重复请求
          ignoreCancelToken: true,
        },
      },
      opt || {}
    )
  );
}
export const defHttp = createAxios();

// other api url
// export const otherHttp = createAxios({
//   requestOptions: {
//     apiUrl: 'xxx',
//   },
// });
