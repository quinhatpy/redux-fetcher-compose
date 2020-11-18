import { DataStatus, FetchStatus } from '../constant/enum';
import { DEFAULT_URI } from '../constant/const';
import { CheckDataStatus, FetcherData } from '../interfaces';

export const getFetcherURI = (handler, params): string => {
  if (handler instanceof Function) {
    return handler(params);
  }

  return DEFAULT_URI;
};

export const checkDataStatus = <FP, TR>(
  fetcherData: FetcherData<FP, TR> = {} as FetcherData<FP, TR>,
): CheckDataStatus => {
  const isStatus = (dataStatus: DataStatus): boolean => {
    switch (dataStatus) {
      case DataStatus.Initial: {
        return fetcherData.fetchStatus === FetchStatus.Init;
      }
      case DataStatus.Initializing: {
        return (
          fetcherData.fetchStatus === FetchStatus.Pending &&
          !fetcherData.previous
        );
      }
      case DataStatus.Initialized: {
        return fetcherData.fetchStatus === FetchStatus.Done;
      }
      case DataStatus.Updating: {
        return (
          fetcherData.fetchStatus === FetchStatus.Pending &&
          !!fetcherData.previous
        );
      }
      case DataStatus.Updated: {
        return (
          fetcherData.fetchStatus === FetchStatus.Done && !!fetcherData.previous
        );
      }
      case DataStatus.Loading: {
        return fetcherData.fetchStatus === FetchStatus.Pending;
      }
      case DataStatus.Error: {
        return (
          fetcherData.fetchStatus === FetchStatus.Done &&
          fetcherData.dataStatus === DataStatus.Error
        );
      }
      case DataStatus.Success: {
        return (
          fetcherData.fetchStatus === FetchStatus.Done &&
          fetcherData.dataStatus === DataStatus.Success
        );
      }
      case DataStatus.Aborted: {
        return fetcherData.fetchStatus === FetchStatus.Aborted;
      }
      case DataStatus.Timeout: {
        return fetcherData.fetchStatus === FetchStatus.Timeout;
      }
      default:
        return false;
    }
  };

  return isStatus;
};
