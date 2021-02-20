/**
 * @description: Login interface parameters
 */
export interface LoginParams {
  account: string;
  password: string;
  tenantView: string;
  tenant: string;
  code: string;
  key: string;
  grantType: string;
  refreshToken: string;
}

/**
 * @description: 获取验证码
 */
export interface GetCaptchaByKeyParams {
  key: string;
}

/**
 * @description: Get user information
 */
export interface GetUserInfoByUserIdParams {
  userId: string | number;
}

export interface RoleInfo {
  roleName: string;
  value: string;
}

/**
 * @description: Login interface return value
 */
export interface LoginResultModel {
  userId: string | number;
  token: string;
  tokenType: string;
  refreshToken: string;
  name: string;
  account: string;
  avatar: string;
  workDescribe: string;
  expire: string;
  expiration: string;
  expireMillis: string;
}

/**
 * @description: Get user information return value
 */
export interface GetUserInfoByUserIdModel {
  // 用户id
  id: string | number;
  // 用户名
  account?: string;
  // 真实名字
  name?: string;
  // 介绍
  workDescribe?: string;
  avatar?: string;
}
