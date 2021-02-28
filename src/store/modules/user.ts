import type {
  LoginParams,
  LogoutParams,
  GetUserInfoByUserIdModel,
  GetUserInfoByUserIdParams,
  GetAuthorityResourceByUserIdParams,
  GetCaptchaByKeyParams,
} from '/@/api/sys/model/userModel';
import { Base64 } from 'js-base64';

import store from '/@/store/index';
import { VuexModule, Module, getModule, Mutation, Action } from 'vuex-module-decorators';
import { hotModuleUnregisterModule } from '/@/utils/helper/vuexHelper';

import { permissionStore } from '/@/store/modules/permission';
import { PageEnum } from '/@/enums/pageEnum';
import { RoleEnum } from '/@/enums/roleEnum';
import {
  CacheTypeEnum,
  ROLES_KEY,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TENANT_KEY,
  USER_INFO_KEY,
  EXPIRE_TIME_KEY,
} from '/@/enums/cacheEnum';

import { useMessage } from '/@/hooks/web/useMessage';

import router from '/@/router';

import {
  loginApi,
  logout,
  getUserInfoById,
  loadCaptcha,
  getPermCodeByUserId,
} from '/@/api/sys/user';

import { Persistent, BasicKeys } from '/@/utils/cache/persistent';
import { useGlobSetting } from '/@/hooks/setting';
import { useI18n } from '/@/hooks/web/useI18n';
import { ErrorMessageMode } from '/@/utils/http/axios/types';
import projectSetting from '/@/settings/projectSetting';

export type UserInfo = Omit<GetUserInfoByUserIdModel, 'roles'>;

const { permissionCacheType } = projectSetting;
const isLocal = permissionCacheType === CacheTypeEnum.LOCAL;
const globSetting = useGlobSetting();

const NAME = 'app-user';
hotModuleUnregisterModule(NAME);

function getCache<T>(key: BasicKeys) {
  const fn = isLocal ? Persistent.getLocal : Persistent.getSession;
  return fn(key) as T;
}

function setCache(key: BasicKeys, value) {
  const fn = isLocal ? Persistent.setLocal : Persistent.setSession;
  return fn(key, value);
}

@Module({ namespaced: true, name: NAME, dynamic: true, store })
class User extends VuexModule {
  // user info
  private userInfoState: UserInfo | null = null;

  // token
  private tokenState = '';

  // refreshToken
  private refreshTokenState = '';

  private expireTimeState = '';

  private tenantState = '';

  // roleList
  private roleListState: RoleEnum[] = [];

  get getUserInfoState(): UserInfo {
    return this.userInfoState || getCache<UserInfo>(USER_INFO_KEY) || {};
  }

  get getTokenState(): string {
    return this.tokenState || getCache<string>(TOKEN_KEY);
  }

  get getRefreshTokenState(): string {
    return this.refreshTokenState || getCache<string>(REFRESH_TOKEN_KEY);
  }

  get getExpireTimeState(): string {
    return this.expireTimeState || getCache<string>(EXPIRE_TIME_KEY);
  }

  get getTenantState(): string {
    return this.tenantState || getCache<string>(TENANT_KEY);
  }

  get getRoleListState(): RoleEnum[] {
    return this.roleListState.length > 0 ? this.roleListState : getCache<RoleEnum[]>(ROLES_KEY);
  }

  @Mutation
  commitResetState(): void {
    this.userInfoState = null;
    this.tokenState = '';
    this.roleListState = [];
  }

  @Mutation
  commitUserInfoState(info: UserInfo): void {
    this.userInfoState = info;
    setCache(USER_INFO_KEY, info);
  }

  @Mutation
  commitRoleListState(roleList: RoleEnum[]): void {
    this.roleListState = roleList;
    setCache(ROLES_KEY, roleList);
  }

  @Mutation
  commitTokenState(info: string): void {
    this.tokenState = info;
    setCache(TOKEN_KEY, info);
  }

  @Mutation
  commitRefreshTokenState(info: string): void {
    this.refreshTokenState = info;
    setCache(REFRESH_TOKEN_KEY, info);
  }

  @Mutation
  commitExpireTimeState(info: string): void {
    this.expireTimeState = info;
    setCache(EXPIRE_TIME_KEY, info);
  }

  @Mutation
  commitTenantState(info: string): void {
    this.tenantState = info;
    setCache(TENANT_KEY, info);
  }

  /**
   * @description: login
   */
  @Action
  async login(
    params: LoginParams & {
      goHome?: boolean;
      mode?: ErrorMessageMode;
    }
  ): Promise<GetUserInfoByUserIdModel | null> {
    try {
      const { goHome = true, mode, ...loginParams } = params;
      loginParams.tenant = `${Base64.encode(loginParams.tenantView as string)}`;
      this.commitTenantState(loginParams.tenant);
      const data = await loginApi(loginParams, mode);
      const { token, refreshToken, expiration } = data;

      // save token
      this.commitTokenState(token);
      this.commitRefreshTokenState(refreshToken);
      this.commitExpireTimeState(expiration);
      const userInfo = {
        id: data.userId,
        account: data.account,
        name: data.name,
        avatar: data.avatar,
        workDescribe: data.workDescribe,
      };
      this.commitUserInfoState(userInfo);

      // 获取权限
      await this.getPermCodeByUserId();

      goHome && (await router.replace(PageEnum.BASE_HOME));
      return userInfo;
    } catch (error) {
      return null;
    }
  }

  /**
   * @description: 加载验证码
   */
  @Action
  async loadCaptcha({ key }: GetCaptchaByKeyParams): Promise<string | ''> {
    try {
      const res = await loadCaptcha(key).catch((e) => {
        const { createMessage } = useMessage();
        if (e.toString().indexOf('429') !== -1) {
          createMessage.error('获取验证码过于频繁，请1分钟后再试');
        } else {
          createMessage.error('加载验证码失败');
        }
      });
      if (res.byteLength <= 100) {
        const { createMessage } = useMessage();
        createMessage.error('系统维护中，请稍微再试~');
        return '';
      }
      return (
        'data:image/png;base64,' +
        btoa(new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), ''))
      );
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  @Action
  async getUserInfoAction({ userId }: GetUserInfoByUserIdParams) {
    const userInfo = await getUserInfoById({ userId });
    // const { roles } = userInfo;
    // const roleList = roles.map((item) => item.value) as RoleEnum[];
    this.commitUserInfoState(userInfo);
    // this.commitRoleListState(roleList);
    return userInfo;
  }

  @Action
  async getPermCodeByUserId(params?: GetAuthorityResourceByUserIdParams) {
    const perm = await getPermCodeByUserId(params);
    const { resourceList } = perm;
    permissionStore.commitPermCodeListState(resourceList);
    permissionStore.commitPermState(perm);
    debugger;
    return perm;
  }

  /**
   * @description: logout
   */
  @Action
  async logout(goLogin = false) {
    const param: LogoutParams = {
      token: this.getTokenState,
      userId: this.getUserInfoState?.id,
      clientId: globSetting.clientId,
    };
    await logout(param).finally(() => {
      goLogin && router.push(PageEnum.BASE_LOGIN);
    });
  }

  /**
   * @description: Confirm before logging out
   */
  @Action
  async confirmLoginOut() {
    const { createConfirm } = useMessage();
    const { t } = useI18n();
    createConfirm({
      iconType: 'warning',
      title: t('sys.app.logoutTip'),
      content: t('sys.app.logoutMessage'),
      onOk: async () => {
        await this.logout(true);
      },
    });
  }
}
export const userStore = getModule<User>(User);
