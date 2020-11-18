import { useContext, useEffect, useRef } from 'react';
import isEqual from 'react-fast-compare';
import { useDispatch, useSelector } from 'react-redux';

import {
  AppStateContext as IAppStateContext,
  CreateFetcherHookArgs,
  UseFetcher,
  FetcherShouldFetchArgs,
  FetcherRefetch,
} from '../../interfaces';
import { DataStatus } from '../../constant/enum';
import AppStateContext from '../../context/app-state-context';
import useEnhancedStore from '../../hooks/use-store';
import { checkDataStatus, getFetcherURI } from '../helpers';

export const defaultShouldFetch = <FP, RS, TR>(
  shouldFetchParams: FetcherShouldFetchArgs<FP, RS, TR>,
): boolean => {
  const isInitializing = checkDataStatus(shouldFetchParams.localState)(
    DataStatus.Initial,
  );

  const isPropsChanged = !isEqual(
    shouldFetchParams.props,
    shouldFetchParams.localState.previousProps,
  );

  return isInitializing || isPropsChanged;
};

const createFetcherHook = <FP, RS, R, TR = R>({
  config,
  fetcherSlice,
  fetchAction,
}: CreateFetcherHookArgs<FP, RS, R, TR>): UseFetcher<FP, TR> => {
  const shouldFetchHandler = config.shouldFetch || defaultShouldFetch;

  function useFetcher(props?: FP, defer: boolean = false) {
    const dispatch = useDispatch();
    const enhancedStore = useEnhancedStore();
    const abortControllerRef = useRef<AbortController>(new AbortController());
    const applicationContext = useContext(AppStateContext);
    const uri = getFetcherURI(config.uri, {
      props,
      getState: enhancedStore.getState,
    });

    const initialFetcherData = () => {
      if (!!fetcherSlice) {
        dispatch(fetcherSlice.actions.initialize({ uri }));
      }
    };

    const getAppStateContext = (): IAppStateContext => applicationContext;

    const shouldFetch = useSelector((state: RS) => {
      const fetcherData = state[fetcherSlice?.name];

      const data = fetcherData?.[uri] || {};

      return shouldFetchHandler({
        props,
        state,
        localState: data,
      });
    });

    const renewAbortController = (): AbortController => {
      abortControllerRef.current = new AbortController();

      return abortControllerRef.current;
    };

    const refetch: FetcherRefetch<FP, TR> = (nextProps: FP = props): TR => {
      return dispatch(fetchAction(nextProps, renewAbortController()));
    };

    useEffect(() => {
      if (config.preHandler instanceof Function) {
        config.preHandler({
          props,
          getState: enhancedStore.getState,
          getAppStateContext,
          dispatch: enhancedStore.dispatch,
          localState: enhancedStore.getState()[fetcherSlice.name][uri],
        });
      }
    }, []);

    useEffect(() => {
      if (shouldFetch && !defer) {
        dispatch(fetchAction(props, renewAbortController()));
      }
    }, [shouldFetch]);

    useEffect(() => {
      return () => {
        abortControllerRef.current.abort();

        if (!config.shouldKeepData) {
          initialFetcherData();
        }
      };
    }, []);

    return [refetch, abortControllerRef.current] as [
      FetcherRefetch<FP, TR>,
      AbortController,
    ];
  }

  return useFetcher;
};

export default createFetcherHook;
