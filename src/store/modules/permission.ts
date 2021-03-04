import type { AppRouteRecordRaw, Menu } from '/@/router/types';
import store from '/@/store/index';
import { hotModuleUnregisterModule } from '/@/utils/helper/vuexHelper';

import { VuexModule, Mutation, Module, getModule, Action } from 'vuex-module-decorators';

import { PermissionModeEnum } from '/@/enums/appEnum';

import { appStore } from '/@/store/modules/app';
import { userStore } from '/@/store/modules/user';

import { asyncRoutes } from '/@/router/routes';
import { filter } from '/@/utils/helper/treeHelper';
import { toRaw } from 'vue';
import { getMenuListById } from '/@/api/sys/menu';

import { transformObjToRoute } from '/@/router/helper/routeHelper';
import { transformRouteToMenu } from '/@/router/helper/menuHelper';

import { useMessage } from '/@/hooks/web/useMessage';
// import { useI18n } from '/@/hooks/web/useI18n';
import { ERROR_LOG_ROUTE, PAGE_NOT_FOUND_ROUTE } from '/@/router/constant';
import { ConstRouter } from '/@/router/routes/index';
import { GetAuthorityResourceByUserIdModel } from '/@/api/sys/model/userModel';
import { PERM_CODE_KEY, PERM_KEY } from '/@/enums/cacheEnum';
import { Persistent } from '/@/utils/cache/persistent';

const { createMessage } = useMessage();
const NAME = 'app-permission';
hotModuleUnregisterModule(NAME);
@Module({ dynamic: true, namespaced: true, store, name: NAME })
class Permission extends VuexModule {
  // Permission code list
  private permCodeListState?: string[];

  // 权限
  private permState?: GetAuthorityResourceByUserIdModel;

  // Whether the route has been dynamically added
  private isDynamicAddedRouteState = false;

  // To trigger a menu update
  private lastBuildMenuTimeState = 0;

  // Backstage menu list
  private backMenuListState: Menu[] = [];

  get getPermCodeListState() {
    return this.permCodeListState || Persistent.getLocal(PERM_CODE_KEY) || [];
  }

  get getPermState() {
    return this.permState || Persistent.getLocal(PERM_KEY) || {};
  }

  get getBackMenuListState() {
    return this.backMenuListState;
  }

  get getLastBuildMenuTimeState() {
    return this.lastBuildMenuTimeState;
  }

  get getIsDynamicAddedRouteState() {
    return this.isDynamicAddedRouteState;
  }

  @Mutation
  commitPermState(perm: GetAuthorityResourceByUserIdModel): void {
    this.permState = perm;
    Persistent.setLocal(PERM_KEY, perm);
  }

  @Mutation
  commitPermCodeListState(codeList: string[]): void {
    this.permCodeListState = codeList;
    Persistent.setLocal(PERM_CODE_KEY, codeList);
  }

  @Mutation
  commitBackMenuListState(list: Menu[]): void {
    this.backMenuListState = list;
  }

  @Mutation
  commitLastBuildMenuTimeState(): void {
    this.lastBuildMenuTimeState = new Date().getTime();
  }

  @Mutation
  commitDynamicAddedRouteState(added: boolean): void {
    this.isDynamicAddedRouteState = added;
  }

  @Mutation
  commitResetState(): void {
    this.isDynamicAddedRouteState = false;
    this.permCodeListState = [];
    this.permState = {} as GetAuthorityResourceByUserIdModel;
    this.backMenuListState = [];
    this.lastBuildMenuTimeState = 0;
  }

  @Action
  async buildRoutesAction(id?: number | string): Promise<AppRouteRecordRaw[]> {
    // const { t } = useI18n();
    let routes: AppRouteRecordRaw[] = [];
    const roleList = toRaw(userStore.getRoleListState) || [];

    const { permissionMode = PermissionModeEnum.ROLE } = appStore.getProjectConfig;

    // role permissions
    if (permissionMode === PermissionModeEnum.ROLE) {
      routes = filter(asyncRoutes, (route) => {
        const { meta } = route as AppRouteRecordRaw;
        const { roles } = meta || {};
        if (!roles) return true;
        return roleList.some((role) => roles.includes(role));
      });
      //  如果确定不需要做后台动态权限,请将下面整个判断注释
    } else if (permissionMode === PermissionModeEnum.BACK) {
      createMessage.loading({
        content: 'Loading menu...',
        // content: 't('sys.app.menuLoading')',
        duration: 1,
      });
      // 这里获取后台路由菜单逻辑自行修改
      const paramId = id || userStore.getUserInfoState.id;
      if (!paramId) {
        throw new Error('paramId is undefined!');
      }

      let routeList = (await getMenuListById({ userId: paramId })) as AppRouteRecordRaw[];
      // 动态引入组件
      routeList = transformObjToRoute(routeList);
      //  后台路由转菜单结构
      const backMenuList = transformRouteToMenu(routeList);
      this.commitBackMenuListState(backMenuList);

      routes = [PAGE_NOT_FOUND_ROUTE, ...ConstRouter, ...routeList];
    }
    routes.push(ERROR_LOG_ROUTE);
    return routes;
  }
}
export const permissionStore = getModule<Permission>(Permission);
