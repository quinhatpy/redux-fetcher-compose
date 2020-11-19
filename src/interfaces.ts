import { FunctionComponent } from 'react';
import {
  ActionCreatorWithPayload,
  Dispatch,
  Reducer,
  ReducersMapObject,
  Slice,
  Store,
} from '@reduxjs/toolkit';

import { DataStatus, FetchStatus } from './constant/enum';

/*================================================================
 * APP STATE
 *================================================================*/

export interface EnhancedStore extends Store {
  reducers: ReducersMapObject;
  registerReducer: (name: string, reducer: Reducer) => void;
}

export interface AppStateContext {
  enhancedStore: EnhancedStore;
  dispatch: Dispatch;
}

export type FnGetAppStateContext = () => AppStateContext;

export interface StoreOptions {
  reducers: ReducersMapObject;
  initialState: Object;
  enableReduxDevTools: boolean;
  middleware?: any;
  getAppStateContext: FnGetAppStateContext;
}

export interface AppStateOptions {
  enableReduxDevTools?: boolean;
  reducers?: ReducersMapObject;
  initialState?: Object;
  middleware?: any;
}

export interface AppState {
  store: EnhancedStore;
  appStateContext: AppStateContext;
}

/*================================================================
 * SERVICE
 *================================================================*/
type RequestOptions = RequestInit & {
  body?: BodyInit | null | {};
};

export interface RequestInfo {
  domain?: string;
  query?: string | {};
  timeout?: number;
  entry: string;
  options: RequestOptions;
}

export interface ServiceArgs<R> {
  getAppStateContext: FnGetAppStateContext;
  requestInfo: RequestInfo;
  abortController: AbortController;
  onPending: () => void;
  onSuccess: (responseParsed: R) => any;
  onError: (responseParsed: R) => any;
}

export interface FetchWithTimeoutArgs {
  url: URL;
  options: RequestOptions;
  requestInfo: RequestInfo;
  abortController: AbortController;
}

/*================================================================
 * CREATE SERVICE
 *================================================================*/

export interface ResponseParsed<R = any, E = any> {
  success: boolean;
  httpStatus: number;
  message: string;
  result: R;
  error: E;
}

export type ResponseParser = <PS = ResponseParsed>(
  response: Response,
) => Promise<PS>;

interface OptionsModifierArgs {
  getAppStateContext: FnGetAppStateContext;
  requestInfo: RequestInfo;
}

export type OptionModifier = (args: OptionsModifierArgs) => RequestOptions;

interface PreRequestHookArgs {
  getAppStateContext: FnGetAppStateContext;
  requestInfo: RequestInfo;
  options: RequestOptions;
}

export type FnPreRequestHook = (args: PreRequestHookArgs) => void;

interface RequestSuccessHook<R> {
  getAppStateContext: FnGetAppStateContext;
  requestInfo: RequestInfo;
  options: RequestOptions;
  responseParsed: R;
}

export type FnRequestSuccessHook = <R>(args: RequestSuccessHook<R>) => void;

interface RequestErrorHook<R> {
  getAppStateContext: FnGetAppStateContext;
  requestInfo: RequestInfo;
  options: RequestOptions;
  responseParsed: R;
}

export type FnRequestErrorHook = <R>(args: RequestErrorHook<R>) => void;

export interface CreateServiceArgs {
  domain?: string;
  requestTimeout?: number;
  responseParser?: ResponseParser;
  optionsModifier?: OptionModifier;
  preRequestHook?: FnPreRequestHook;
  requestSuccessHook?: FnRequestSuccessHook;
  requestErrorHook?: FnRequestErrorHook;
}

export type Service<R> = (serviceParam: ServiceArgs<R>) => Promise<any>;

/*================================================================
 * FETCHER SLICE DATA
 *================================================================*/

export interface FetcherData<FP, TR> {
  fetchStatus: FetchStatus;
  dataStatus: DataStatus;
  value: TR;
  previous: FetcherData<FP, TR>;
  currentProps: FP;
  previousProps: FP;
}

export interface FetcherSliceData<FP, TR> {
  [uri: string]: FetcherData<FP, TR>;
}

export interface FetcherActionPayloadData<FP, TR> {
  uri?: string;
  fetchStatus: FetchStatus;
  dataStatus: DataStatus;
  value: TR;
  previousProps?: FP;
  currentProps?: FP;
}

/*================================================================
 * FETCHER CONFIG
 *================================================================*/

interface FetcherURIArgs<FP, RS> {
  props: FP;
  getState: () => RS;
}

export type FnFetcherURI<FP, RS = any> = (
  fetcherUri: FetcherURIArgs<FP, RS>,
) => string;

export type FnFetcherRequestInfo<FP> = (
  props: FP,
  getAppStateContext: FnGetAppStateContext,
) => RequestInfo;

export interface FetcherShouldFetchArgs<FP, RS, TR> {
  props: FP;
  state: RS;
  localState: FetcherData<FP, TR>;
}

export type FnFetcherShouldFetch<FP, RS = any, TR = any> = (
  fetcherShouldFetch: FetcherShouldFetchArgs<FP, RS, TR>,
) => boolean;

interface FetcherPreHandlerArgs<FP, RS, TR> {
  props: FP;
  getState: () => RS;
  getAppStateContext: FnGetAppStateContext;
  dispatch: Dispatch;
  localState: FetcherData<FP, TR>;
}

export type FnFetcherPreHandler<FP, RS = any, TR = any> = (
  fetcherPreHandler: FetcherPreHandlerArgs<FP, RS, TR>,
) => void;

export interface FetcherPendingArgs<FP, RS, TR> {
  props: FP;
  requestInfo: RequestInfo;
  getState: () => RS;
  localState: FetcherData<FP, TR>;
  getAppStateContext: FnGetAppStateContext;
  dispatch: Dispatch;
}

export type FnFetcherOnPendingHandler<FP, RS = any, TR = any> = (
  fetcherPending: FetcherPendingArgs<FP, RS, TR>,
) => any;

export interface FetcherSuccessArgs<FP, RS, R, TR> {
  props: FP;
  requestInfo: RequestInfo;
  res: R;
  localState: FetcherData<FP, TR>;
  getState: () => RS;
  getAppStateContext: FnGetAppStateContext;
  dispatch: Dispatch;
}

export type FnFetcherOnSuccessHandler<FP, RS = any, R = any, TR = any> = (
  fetcherSuccess: FetcherSuccessArgs<FP, RS, R, TR>,
) => TR | R;

export interface FetcherErrorArgs<FP, RS, R, TR> {
  props: FP;
  requestInfo: RequestInfo;
  error: R;
  localState: FetcherData<FP, TR>;
  getState: () => RS;
  getAppStateContext: FnGetAppStateContext;
  dispatch: Dispatch;
}

export type FnFetcherOnErrorHandler<FP, RS = any, R = any, TR = any> = (
  fetcherError: FetcherErrorArgs<FP, RS, R, TR>,
) => TR | R;

export interface FetcherConfig<FP, RS, R = any, TR = any> {
  id?: string;
  shouldKeepData?: boolean;
  uri?: FnFetcherURI<FP, RS>;
  service: Service<R>;
  requestInfo: FnFetcherRequestInfo<FP>;
  shouldFetch?: FnFetcherShouldFetch<FP, RS, TR>;
  preHandler?: FnFetcherPreHandler<FP, RS, TR>;
  onPending?: FnFetcherOnPendingHandler<FP, RS, TR>;
  onSuccess?: FnFetcherOnSuccessHandler<FP, RS, R, TR>;
  onError?: FnFetcherOnErrorHandler<FP, RS, R, TR>;
}

/*================================================================
 * CREATE FETCHER ACTION
 *================================================================*/

export interface CreateFetcherActionArgs<FP, RS, R, TR> {
  config: FetcherConfig<FP, RS, R, TR>;
  fetcherSlice: Slice;
}

export type FetcherAction<FP> = (
  props?: FP,
  abortController?: AbortController,
) => any;

/*================================================================
 * CREATE FETCHER HOOK
 *================================================================*/

export interface CreateFetcherHookArgs<FP, RS, R, TR> {
  config: FetcherConfig<FP, RS, R, TR>;
  fetcherSlice: Slice;
  fetchAction: FetcherAction<FP>;
}

export type UseFetcher<FP, TR> = (
  props?: FP,
  defer?: boolean,
) => [FetcherRefetch<FP, TR>, AbortController];

/*================================================================
 * CREATE GETTER HOOK
 *================================================================*/

export interface GetterData<FP, TR, TG = TR> extends FetcherData<FP, TR | TG> {
  isStatus: (dataStatus: DataStatus) => boolean;
  isLoading: boolean;
}

export type TransformGetter<FP, TR, TG> = (getter: GetterData<FP, TR>) => TG;

export type UseGetter<FP, TR> = <TG = TR>(
  props?: FP,
  transform?: TransformGetter<FP, TR, TG>,
) => GetterData<FP, TR, TG>;

/*================================================================
 * CREATE FETCHER COMPOSE HOOK
 *================================================================*/

export interface CreateFetcherComposeHookArgs<FP, TR> {
  useFetcher: UseFetcher<FP, TR>;
  useGetter: UseGetter<FP, TR>;
}

export type FetcherRefetch<FP, TR> = (props?: FP) => TR;

export type FetcherComposeHookData<FP, TR, TG> = [
  GetterData<FP, TR, TG>,
  FetcherRefetch<FP, TR>,
  AbortController,
];

export type UseFetcherCompose<FP, TR> = <TG = TR>(
  props?: FP,
  transform?: TransformGetter<FP, TR, TG>,
) => FetcherComposeHookData<FP, TR, TG>;

/*================================================================
 * CREATE FETCHER COMPONENT
 *================================================================*/

export type FetcherComponent<FP, TR> = FunctionComponent<
  FP & { transform?: TransformGetter<FP, TR, any> }
>;

/*================================================================
 * CREATE FETCHER
 *================================================================*/

export interface Fetcher<FP, TR> {
  action: FetcherAction<FP>;
  component: FetcherComponent<FP, TR>;
  useFetcher: UseFetcher<FP, TR>;
  useFetcherCompose: UseFetcherCompose<FP, TR>;
  useGetter: UseGetter<FP, TR>;
}

/*================================================================
 * FETCHER FUNCTION HANDLER
 *================================================================*/

interface DataActionHandlerPrams<FP, TR> {
  uri: string;
  fetchStatus: FetchStatus;
  dataStatus?: DataStatus;
  value: TR;
  currentProps?: FP;
  previousProps?: FP;
}

export type DataActionHandler<FP, TR> = ActionCreatorWithPayload<
  DataActionHandlerPrams<FP, TR>
>;

export interface FetcherHandlerDataConfig<FP, TR> {
  uri: string;
  dataActionHandler: DataActionHandler<FP, TR>;
}

export interface OnPendingHandlerArgs<FP, RS, R, TR> {
  config: FetcherConfig<FP, RS, R, TR>;
  params: FetcherPendingArgs<FP, RS, TR>;
  dataConfig: FetcherHandlerDataConfig<FP, TR>;
}

export interface OnSuccessHandlerArgs<FP, RS, R, TR> {
  config: FetcherConfig<FP, RS, R, TR>;
  params: FetcherSuccessArgs<FP, RS, R, TR>;
  dataConfig: FetcherHandlerDataConfig<FP, TR | R>;
}

export interface OnErrorHandlerArgs<FP, RS, R, TR> {
  config: FetcherConfig<FP, RS, R, TR>;
  params: FetcherErrorArgs<FP, RS, R, TR>;
  dataConfig: FetcherHandlerDataConfig<FP, TR | R>;
}

/*================================================================
 * FETCHER HELPER
 *================================================================*/

export type CheckDataStatus = (dataStatus: DataStatus) => boolean;
