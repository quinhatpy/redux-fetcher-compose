import {
  combineReducers,
  configureStore,
  getDefaultMiddleware,
  Reducer,
  Store,
} from '@reduxjs/toolkit';
import { EnhancedStore, StoreOptions } from 'interfaces';

const createStore = ({
  enableReduxDevTools = false,
  initialState = {},
  reducers = {},
  middleware,
  getAppStateContext,
}: StoreOptions): EnhancedStore => {
  const nextMiddleware = [
    ...getDefaultMiddleware({
      thunk: { extraArgument: getAppStateContext },
    }),
    ...(middleware || []),
  ];

  const store: Store = configureStore({
    reducer: combineReducers(reducers),
    preloadedState: initialState,
    devTools: enableReduxDevTools,
    middleware: nextMiddleware,
  });

  const enhancedStore: EnhancedStore = {
    ...store,
    reducers,
  } as EnhancedStore;

  const registerReducer = (name: string, reducer: Reducer) => {
    if (!enhancedStore.reducers.hasOwnProperty(name)) {
      const nextReducers = {
        ...enhancedStore.reducers,
        [name]: reducer,
      };

      enhancedStore.reducers = nextReducers;
      enhancedStore.replaceReducer(combineReducers(nextReducers));
    }
  };

  return {
    ...enhancedStore,
    registerReducer,
  };
};

export default createStore;
