import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import AppStateContext from '../context/app-state-context';

import { AppState } from '../interfaces';

interface Props {
  appState: AppState;
  children: React.ReactNode;
}

const DataProvider: FunctionComponent<Props> = ({ appState, children }) => {
  return (
    <AppStateContext.Provider value={appState.appStateContext}>
      <Provider store={appState.store}>{children}</Provider>
    </AppStateContext.Provider>
  );
};

export default DataProvider;
