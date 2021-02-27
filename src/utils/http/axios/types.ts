import type { AxiosRequestConfig } from 'axios';
import type { AxiosTransform } from './axiosTransform';
export type ErrorMessageMode = 'none' | 'modal' | 'message' | undefined;

export interface RequestOptions {
  // Splicing request parameters to url
  joinParamsToUrl?: boolean;
  // Format request parameter time
  formatDate?: boolean;
  //  Whether to process the request result
  isTransformRequestResult?: boolean;
  // Whether to join url
  joinPrefix?: boolean;
  // Interface address, use the default apiUrl if you leave it blank
  apiUrl?: string;
  // Error message prompt type
  errorMessageMode?: ErrorMessageMode;
  // Whether to add a timestamp
  joinTime?: boolean;
}

export interface CreateAxiosOptions extends AxiosRequestConfig {
  // 接口可能会有通用的地址部分，可以统一抽取出来
  prefixUrl?: string;
  // 数据处理方式
  transform?: AxiosTransform;
  // 配置项，下面的选项都可以在独立的接口请求中覆盖
  requestOptions?: RequestOptions;
}

export interface Result<T = any> {
  code: number;
  type: 'success' | 'error' | 'warning';
  msg: string;
  data: T;
}

// multipart/form-data: upload file
export interface UploadFileParams {
  // Other parameters
  data?: Indexable;
  // File parameter interface field name
  name?: string;
  // file name
  file: File | Blob;
  // file name
  filename?: string;
  [key: string]: any;
}
