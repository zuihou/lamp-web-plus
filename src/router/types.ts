import type { RouteRecordRaw } from 'vue-router';
import { RoleEnum } from '/@/enums/roleEnum';

import type { Component } from '/@/components/types';

export interface RouteMeta {
  // 路由title  一般必填
  title: string;
  // 是否忽略权限，只在权限模式为Role的时候有效
  ignoreAuth?: boolean;
  // 可以访问的角色，只在权限模式为Role的时候有效
  roles?: RoleEnum[];
  // 是否忽略KeepAlive缓存
  ignoreKeepAlive?: boolean;
  // 是否固定标签
  affix?: boolean;
  // 图标，也是菜单图标
  icon?: string;
  // 内嵌iframe的地址
  frameSrc?: string;

  // 指定该路由切换的动画名
  transitionName?: string;

  // 隐藏该路由在面包屑上面的显示
  hideBreadcrumb?: boolean;

  // 如果该路由会携带参数，且需要在tab页上面显示。则需要设置为true
  carryParam?: boolean;

  // Used internally to mark single-level menus
  single?: boolean;

  // 当前激活的菜单。用于配置详情页时左侧激活的菜单路径
  currentActiveMenu?: string;

  // 当前路由不再标签页显示
  hideTab?: boolean;

  // 当前路由不再菜单显示
  hideMenu?: boolean;
}

// @ts-ignore
export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'meta'> {
  name: string;
  meta: RouteMeta;
  component?: Component | string;
  components?: Component;
  children?: AppRouteRecordRaw[];
  props?: Recordable;
  fullPath?: string;
}
export interface MenuTag {
  // 类型
  type?: 'primary' | 'error' | 'warn' | 'success';
  // 内容
  content?: string;
  // 为true则显示小圆点
  dot?: boolean;
}

export interface Menu {
  //  菜单名
  name: string;
  // 菜单图标,如果没有，则会尝试使用route.meta.icon
  icon?: string;
  // 菜单路径
  path: string;
  // 是否禁用
  disabled?: boolean;
  // 子菜单
  children?: Menu[];
  // 排序
  orderNo?: number;
  // 角色
  roles?: RoleEnum[];
  // 元数据
  meta?: Partial<RouteMeta>;
  // 菜单标签设置
  tag?: MenuTag;
}

export interface MenuModule {
  orderNo?: number;
  menu: Menu;
}

// interface RouteModule {
//   layout: AppRouteRecordRaw;
//   routes: AppRouteRecordRaw[];
//   children?: AppRouteRecordRaw[];
//   component?: Component;
// }

// export type AppRouteModule = RouteModule | AppRouteRecordRaw;
export type AppRouteModule = AppRouteRecordRaw;
