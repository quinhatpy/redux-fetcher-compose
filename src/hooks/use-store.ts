import { useStore } from 'react-redux';
import { EnhancedStore } from '../interfaces';

const useEnhancedStore = (): EnhancedStore => {
  return useStore() as EnhancedStore;
};

export default useEnhancedStore;
