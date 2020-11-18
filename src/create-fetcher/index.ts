import { FetcherConfig, Fetcher } from '../interfaces';
import createFetcherSlice from './create-fetcher-slice';
import createFetcherAction from './create-fetcher-action';
import createFetcherHook from './create-fetcher-hook';
import createGetterHook from './create-getter-hook';
import createFetcherComposeHook from './create-fetcher-compose-hook';
import createFetcherComponent from './create-fetcher-component';

/**
 * @generator {FP}: Fetcher prop
 * @generator {RS}: Root state,
 * @generator {R}: Response,
 * @generator {TR}: Transform response
 * @param config
 */

const createFetcher = <FP, RS = any, R = any, TR = R>(
  config: FetcherConfig<FP, RS, R, TR>,
): Fetcher<FP, TR> => {
  const shouldInitSlice = !!config.id;
  const fetcherSlice = shouldInitSlice
    ? createFetcherSlice<FP, TR>(config.id)
    : null;

  const fetchAction = createFetcherAction<FP, RS, R, TR>({
    config,
    fetcherSlice,
  });

  const useFetcher = createFetcherHook<FP, RS, R, TR>({
    config,
    fetcherSlice,
    fetchAction,
  });
  const useGetter = createGetterHook<FP, RS, R, TR>(config, fetcherSlice);
  const useFetcherCompose = createFetcherComposeHook<FP, TR>({
    useFetcher,
    useGetter,
  });
  const FetcherComponent = createFetcherComponent<FP, TR>(useFetcherCompose);

  return {
    action: fetchAction,
    component: FetcherComponent,
    useFetcher,
    useGetter,
    useFetcherCompose,
  };
};

export default createFetcher;
