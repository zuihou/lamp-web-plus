import { defHttp } from '/@/utils/http/axios';
import { GetVisitListResult } from './model/welcomeModel';

enum Api {
  GetVisitList = `/authority/dashboard/visit`,
}

/**
 * @description: Get user menu based on id
 */

export const getVisitList = () => {
  return defHttp.get<GetVisitListResult>({ url: Api.GetVisitList });
};
