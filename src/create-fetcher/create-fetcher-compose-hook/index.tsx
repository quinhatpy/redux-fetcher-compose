import React from 'react';

import {
  CreateFetcherComposeHookArgs,
  UseFetcherCompose,
  TransformGetter,
  FetcherComposeHookData,
} from '../../interfaces';

const createFetcherComposeHook = <FP, R, TR = R>({
  useFetcher,
  useGetter,
}: CreateFetcherComposeHookArgs<FP, TR>): UseFetcherCompose<FP, TR> => {
  function useFetcherCompose<TG = TR>(
    props?: FP,
    transform?: TransformGetter<FP, TR, TG>,
  ): FetcherComposeHookData<FP, TR, TG> {
    const getter = useGetter<TG>(props, transform);

    const [refetch, abortController] = useFetcher(props);

    return [getter, refetch, abortController];
  }

  return useFetcherCompose;
};

export default createFetcherComposeHook;
