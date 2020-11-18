import { useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';
import { Slice } from '@reduxjs/toolkit';

import {
  FetcherConfig,
  FetcherData,
  GetterData,
  TransformGetter,
  UseGetter,
} from '../../interfaces';
import { DataStatus } from '../../constant/enum';
import { checkDataStatus, getFetcherURI } from '../helpers';

const createGetterHook = <FP, RS, R, TR>(
  config: FetcherConfig<FP, RS, R, TR>,
  fetcherSlice: Slice,
): UseGetter<FP, TR> => {
  function useGetter<TG = TR>(
    props: FP,
    transform?: TransformGetter<FP, TR, TG>,
  ): GetterData<FP, TR, TG> {
    const store = useStore();
    const uri = getFetcherURI(config.uri, {
      props,
      getState: store.getState,
    });
    const localState: FetcherData<FP, TR> = useSelector(
      (state) => state?.[fetcherSlice?.name]?.[uri] || {},
    );
    const isStatus = checkDataStatus<FP, TR>(localState);

    const transformHandler = useMemo(() => {
      if (transform instanceof Function) {
        const getterData: GetterData<FP, TR> = {
          ...localState,
          isStatus,
          isLoading: isStatus(DataStatus.Loading),
        };
        const dataTransform = transform(getterData);

        return {
          ...localState,
          value: dataTransform,
        };
      }

      return localState;
    }, [transform, localState]);

    return {
      ...transformHandler,
      isStatus,
      isLoading: isStatus(DataStatus.Loading),
    };
  }

  return useGetter;
};

export default createGetterHook;
