import type { AppRouteRecordRaw, AppRouteModule } from '/@/router/types';

import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '../constant';

import { mainOutRoutes } from './mainOut';
import { PageEnum } from '/@/enums/pageEnum';
import { t } from '/@/hooks/web/useI18n';
import { LAYOUT } from '/@/router/constant';

const modules = import.meta.globEager('./modules/**/*.ts');

const routeModuleList: AppRouteModule[] = [];

Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});

export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList];

export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
};

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('/@/views/sys/login/Login.vue'),
  meta: {
    title: t('routes.basic.login'),
  },
};

/**
 * 前端路由，不会显示到菜单
 */
export const ConstRouter: AppRouteRecordRaw[] = [
  {
    path: '/home',
    name: 'Home',
    component: LAYOUT,
    redirect: '/home/welcome',
    meta: {
      icon: 'bx:bx-home',
      title: t('routes.dashboard.welcome'),
    },
    children: [
      {
        path: 'welcome',
        name: 'Welcome',
        component: () => import('/@/views/dashboard/welcome/index.vue'),
        meta: {
          title: t('routes.dashboard.welcome'),
          affix: true,
          icon: 'bx:bx-home',
        },
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: LAYOUT,
    redirect: '/dashboard/workbench',
    meta: {
      icon: 'bx:bx-home',
      title: t('routes.dashboard.dashboard'),
    },
    children: [
      {
        path: 'workbench',
        name: 'Workbench',
        component: () => import('/@/views/dashboard/workbench/index.vue'),
        meta: {
          title: t('routes.dashboard.workbench'),
        },
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('/@/views/dashboard/analysis/index.vue'),
        meta: {
          title: t('routes.dashboard.analysis'),
        },
      },
    ],
  },
];

// Basic routing without permission
export const basicRoutes = [LoginRoute, RootRoute, ...mainOutRoutes, REDIRECT_ROUTE];
