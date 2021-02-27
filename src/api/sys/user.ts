import { defHttp } from '/@/utils/http/axios';
import {
  LoginParams,
  LoginResultModel,
  GetUserInfoByUserIdParams,
  GetUserInfoByUserIdModel,
  GetAuthorityResourceByUserIdParams,
  GetAuthorityResourceByUserIdModel,
} from './model/userModel';
import { ErrorMessageMode } from '/@/utils/http/axios/types';

enum Api {
  GetUserInfoById = '/getUserInfoById',
  GetPermCodeByUserId = '/oauth/resource/visible',
  Login = '/oauth/noToken/login',
  LoadCaptcha = '/oauth/anno/captcha',
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<LoginResultModel>(
    {
      url: Api.Login,
      params,
      headers: {
        tenant: params.tenant,
        'x-is-tenant': false,
        // 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
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
  return defHttp.get<GetUserInfoByUserIdModel>({
    url: Api.GetUserInfoById,
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

/**
 * 根据
 * @param params
 */
export function getPermCodeByUserId(params?: GetAuthorityResourceByUserIdParams) {
  return defHttp.get<GetAuthorityResourceByUserIdModel>({
    url: Api.GetPermCodeByUserId,
    params,
  });
}
