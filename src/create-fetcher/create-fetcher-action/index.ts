import { Dispatch } from '@reduxjs/toolkit';

import {
  FnGetAppStateContext,
  CreateFetcherActionArgs,
  FetcherAction,
} from './../../interfaces';
import { getFetcherURI } from '../helpers';
import handleOnPending from './handle-on-pending';
import handleOnSuccess from './handle-on-success';
import handleOnError from './handle-on-error';

const createFetcherAction = <FP, RS, R, TR = R>({
  config,
  fetcherSlice,
}: CreateFetcherActionArgs<FP, RS, R, TR>): FetcherAction<FP> => {
  return (props?: FP, abortController?: AbortController) => {
    return (
      dispatch: Dispatch,
      getState: () => RS,
      getAppStateContext: FnGetAppStateContext,
    ) => {
      const nextAbortController = abortController ?? new AbortController();
      const { enhancedStore } = getAppStateContext();
      const uri = getFetcherURI(config.uri, {
        props,
        getState: enhancedStore.getState,
      });
      const fetcherData = getState()[fetcherSlice?.name];
      const localState = fetcherData?.[uri];

      if (!!fetcherSlice) {
        if (!fetcherData) {
          enhancedStore.registerReducer(
            fetcherSlice.name,
            fetcherSlice.reducer,
          );
        }

        if (localState?.dataStatus === undefined) {
          dispatch(fetcherSlice.actions.initialize({ uri }));
        }
      }

      const requestInfo = config.requestInfo(props, getAppStateContext);

      const serviceOnPendingHandler = () => {
        return handleOnPending<FP, RS, R, TR>({
          config,
          params: {
            props,
            requestInfo,
            localState,
            getState,
            getAppStateContext,
            dispatch,
          },
          dataConfig: {
            uri,
            dataActionHandler: fetcherSlice?.actions?.pending,
          },
        });
      };

      const serviceOnSuccessHandler = (res: R) => {
        return handleOnSuccess<FP, RS, R, TR>({
          config,
          params: {
            props,
            requestInfo,
            res,
            localState,
            getState,
            getAppStateContext,
            dispatch,
          },
          dataConfig: {
            uri,
            dataActionHandler: fetcherSlice?.actions?.done,
          },
        });
      };

      const serviceOnErrorHandler = (error: R) => {
        return handleOnError<FP, RS, R, TR>({
          config,
          params: {
            props,
            requestInfo,
            error,
            localState,
            getState,
            getAppStateContext,
            dispatch,
          },
          dataConfig: {
            uri,
            dataActionHandler: fetcherSlice?.actions?.done,
          },
        });
      };

      return config.service({
        requestInfo: requestInfo,
        abortController: nextAbortController,
        getAppStateContext,
        onPending: serviceOnPendingHandler,
        onSuccess: serviceOnSuccessHandler,
        onError: serviceOnErrorHandler,
      });
    };
  };
};

export default createFetcherAction;
