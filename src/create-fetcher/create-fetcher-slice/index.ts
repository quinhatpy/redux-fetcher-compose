import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

import { FetchStatus, DataStatus } from '../../constant/enum';
import { DEFAULT_URI } from '../../constant/const';
import { FetcherSliceData, FetcherActionPayloadData } from '../../interfaces';

const createFetcherSlice = <FP, TR>(fetcherId: string): Slice => {
  const reducerName = `Fetch.${fetcherId}`;
  const initialState: FetcherSliceData<FP, TR> = {
    [DEFAULT_URI]: {
      fetchStatus: FetchStatus.Init,
      dataStatus: DataStatus.Initial,
      value: null,
      previous: null,
      currentProps: null,
      previousProps: null,
    },
  };

  return createSlice({
    name: reducerName,
    initialState,
    reducers: {
      initialize: (
        state,
        action: PayloadAction<FetcherActionPayloadData<FP, TR>>,
      ) => {
        const { uri = DEFAULT_URI } = action.payload;

        state[uri] = {
          fetchStatus: FetchStatus.Init,
          dataStatus: DataStatus.Initial,
          value: null,
          previous: null,
          currentProps: null,
          previousProps: null,
        };
      },
      pending: (
        state,
        action: PayloadAction<FetcherActionPayloadData<FP, TR>>,
      ) => {
        const {
          uri = DEFAULT_URI,
          dataStatus,
          value,
          currentProps,
        } = action.payload;
        const previous = Object.assign(
          { ...state[uri] },
          { previous: undefined },
        );

        state[uri].fetchStatus = FetchStatus.Pending;
        state[uri].dataStatus = dataStatus;
        state[uri].value = value as any;
        state[uri].previous = previous;
        state[uri].currentProps = currentProps;
      },

      done: (
        state,
        action: PayloadAction<FetcherActionPayloadData<FP, TR>>,
      ) => {
        const {
          uri = DEFAULT_URI,
          fetchStatus,
          dataStatus,
          value,
          previousProps,
        } = action.payload;
        const previous = Object.assign(
          { ...state[uri] },
          { previous: undefined },
        );

        state[uri].fetchStatus = fetchStatus;
        state[uri].dataStatus = dataStatus;
        state[uri].value = value as any;
        state[uri].previous = previous;
        state[uri].previousProps = previousProps;
      },
    },
  });
};

export default createFetcherSlice;
