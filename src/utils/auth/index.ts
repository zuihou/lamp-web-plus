import { userStore } from '/@/store/modules/user';

/**
 * @description:  Get token
 * @return jwt token
 */
export function getToken(): string {
  return userStore.getTokenState;
}
/**
 * @description:  Get tenant
 * @return tenant
 */
export function getTenant(): string {
  return userStore.getTenantState;
}
