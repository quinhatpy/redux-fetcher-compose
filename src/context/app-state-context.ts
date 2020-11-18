import { createContext } from 'react';

import { AppStateContext as IAppStateContext } from '../interfaces';

const AppStateContext = createContext<IAppStateContext>(undefined);

export default AppStateContext;
