import { AppStateContext, AppState, AppStateOptions } from 'interfaces';
import createStore from './create-store';

const createAppState = (options: AppStateOptions): AppState => {
  const {
    initialState = {},
    enableReduxDevTools = false,
    reducers = {},
    middleware = [],
  } = options;
  let appStateContext: AppStateContext;

  const getAppStateContext = () => appStateContext;

  const enhancedStore = createStore({
    reducers,
    initialState,
    enableReduxDevTools,
    middleware,
    getAppStateContext,
  });

  appStateContext = {
    enhancedStore,
    dispatch: enhancedStore.dispatch,
  };

  return {
    store: enhancedStore,
    appStateContext,
  };
};

export default createAppState;
