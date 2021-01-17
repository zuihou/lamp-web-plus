import type { ProjectConfig } from '/@/types/config';

import { MenuTypeEnum, MenuModeEnum, TriggerEnum, MixSidebarTriggerEnum } from '/@/enums/menuEnum';
import { CacheTypeEnum } from '/@/enums/cacheEnum';
import { ContentEnum, PermissionModeEnum, ThemeEnum, RouterTransitionEnum } from '/@/enums/appEnum';
import { primaryColor } from '../../build/config/lessModifyVars';

// ! 改动后需要清空浏览器缓存
const setting: ProjectConfig = {
  // 是否显示SettingButton
  showSettingButton: true,

  //  权限模式,默认前端角色权限模式
  permissionMode: PermissionModeEnum.ROLE,

  // 权限缓存存放位置。默认存放于localStorage
  permissionCacheType: CacheTypeEnum.LOCAL,

  // color
  // TODO Theme color
  themeColor: primaryColor,

  // 网站灰色模式，用于可能悼念的日期开启
  grayMode: false,

  // 色弱模式
  colorWeak: false,

  // 是否取消菜单,顶部,多标签页显示, 用于可能内嵌在别的系统内
  fullContent: false,

  //  主题内容宽度
  contentMode: ContentEnum.FULL,

  // 是否显示logo
  showLogo: true,

  // 是否显示底部信息 copyright
  showFooter: false,

  // 多语言配置
  locale: {
    // 是否显示
    show: true,
    // 当前语言
    lang: 'zh_CN',
    // 默认语言
    fallback: 'zh_CN',
    // 允许的语言
    availableLocales: ['zh_CN', 'en'],
  },

  // 头部配置
  headerSetting: {
    // 背景色
    bgColor: '#ffffff',
    // 固定头部
    fixed: true,
    // 是否显示顶部
    show: true,
    // 主题
    theme: ThemeEnum.LIGHT,
    // 开启锁屏功能
    useLockPage: true,
    // Whether to show the full screen button
    showFullScreen: true,
    // 显示文档按钮
    showDoc: false,
    // 显示消息中心按钮
    showNotice: true,
    // 显示菜单搜索按钮
    showSearch: true,
  },

  // 菜单配置
  menuSetting: {
    // 背景色
    bgColor: '#001529',
    //  是否固定住菜单
    fixed: true,
    // 菜单折叠
    collapsed: false,
    // 折叠菜单时候是否显示菜单名
    collapsedShowTitle: false,
    // 是否可拖拽
    // Only limited to the opening of the left menu, the mouse has a drag bar on the right side of the menu
    canDrag: false,
    // 是否显示
    show: true,
    // Whether to show dom
    hidden: false,
    // 菜单宽度
    menuWidth: 210,
    // 菜单模式
    mode: MenuModeEnum.INLINE,
    // 菜单类型
    type: MenuTypeEnum.SIDEBAR,
    // 菜单主题
    theme: ThemeEnum.DARK,
    // 分割菜单
    split: false,
    //顶部菜单布局
    topMenuAlign: 'center',
    // 折叠触发器的位置
    trigger: TriggerEnum.HEADER,
    // 手风琴模式，只展示一个菜单
    accordion: true,
    // 在路由切换的时候关闭左侧混合菜单展开菜单
    closeMixSidebarOnChange: false,
    // 左侧混合菜单模块切换触发方式
    mixSideTrigger: MixSidebarTriggerEnum.CLICK,
    //  是否固定左侧混合菜单
    mixSideFixed: false,
  },

  // 多标签
  multiTabsSetting: {
    // 开启
    show: true,
    // 开启快速操作
    canDrag: true,
    // 是否可以拖拽
    showQuick: true,

    // 是否显示刷新按钮
    showRedo: true,
    // 是否显示折叠按钮
    showFold: true,
  },

  // 动画配置
  transitionSetting: {
    //  是否开启切换动画
    // The disabled state will also disable pageLoadinng
    enable: true,

    // 动画名
    basicTransition: RouterTransitionEnum.FADE_SIDE,

    // 是否打开页面切换loading
    // Only open when enable=true
    openPageLoading: true,

    // 是否打开页面切换顶部进度条
    openNProgress: false,
  },

  // 是否开启KeepAlive缓存  开发时候最好关闭,不然每次都需要清除缓存
  openKeepAlive: true,

  // 自动锁屏时间，为0不锁屏。 单位分钟 默认1个小时
  lockTime: 0,

  // 显示面包屑
  showBreadCrumb: true,

  // 显示面包屑图标
  showBreadCrumbIcon: false,

  // 开启页面切换动画
  useErrorHandle: false,

  // Whether to open back to top
  useOpenBackTop: true,

  //  Is it possible to embed iframe pages
  canEmbedIFramePage: true,

  // Whether to delete unclosed messages and notify when switching the interface
  closeMessageOnSwitch: true,

  // Whether to cancel the http request that has been sent but not responded when switching the interface.
  // If it is enabled, I want to overwrite a single interface. Can be set in a separate interface
  removeAllHttpPending: false,
};

export default setting;
