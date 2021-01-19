import { defHttp } from '/@/utils/http/axios';
import {
  LoginParams,
  LoginResultModel,
  GetUserInfoByUserIdParams,
  GetUserInfoByUserIdModel,
} from './model/userModel';
import { ErrorMessageMode } from '/@/utils/http/axios/types';

enum Api {
  Login = '/login',
  GetUserInfoById = '/getUserInfoById',
  GetPermCodeByUserId = '/getPermCodeByUserId',
  LoadCaptcha = '/oauth/anno/captcha',
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.request<LoginResultModel>(
    {
      url: Api.Login,
      method: 'POST',
      params,
    },
    {
      errorMessageMode: mode,
    }
  );
}

/**
 * @description: getUserInfoById
 */
export function getUserInfoById(params: GetUserInfoByUserIdParams) {
  return defHttp.request<GetUserInfoByUserIdModel>({
    url: Api.GetUserInfoById,
    method: 'GET',
    params,
  });
}

/**
 * @description: 加载验证码
 */
export function loadCaptcha(key: String) {
  return defHttp.request(
    {
      url: Api.LoadCaptcha,
      method: 'GET',
      responseType: 'arraybuffer',
      params: { key: key },
    },
    { isTransformRequestResult: false }
  );
}

export function getPermCodeByUserId(params: GetUserInfoByUserIdParams) {
  return defHttp.request<string[]>({
    url: Api.GetPermCodeByUserId,
    method: 'GET',
    params,
  });
}
