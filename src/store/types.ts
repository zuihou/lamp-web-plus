export interface LockInfo {
  pwd: string | undefined;
  isLock: boolean;
}

export interface UserInfo {
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
