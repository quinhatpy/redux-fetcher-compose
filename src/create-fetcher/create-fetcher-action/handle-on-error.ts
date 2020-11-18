import { FetcherErrorArgs, OnErrorHandlerArgs } from '../../interfaces';
import { DataStatus, FetchStatus } from '../../constant/enum';

const defaultOnError = <FP, RS, R, TR>(
  onErrorParams: FetcherErrorArgs<FP, RS, R, TR>,
): TR | R => {
  return onErrorParams.error;
};

const handleOnError = <FP, RS, R, TR = any>({
  config,
  params,
  dataConfig,
}: OnErrorHandlerArgs<FP, RS, R, TR>) => {
  const onError = config.onError ?? defaultOnError;

  const data = onError(params);

  if (dataConfig.dataActionHandler instanceof Function) {
    // @ts-ignore
    if (data.error?.name === 'AbortError' || data.httpStatus === 499) {
      // @ts-ignore
      const isTimeout = data.httpStatus === 499;

      params.dispatch(
        dataConfig.dataActionHandler({
          uri: dataConfig.uri,
          fetchStatus: isTimeout ? FetchStatus.Timeout : FetchStatus.Aborted,
          dataStatus: DataStatus.Error,
          value: JSON.parse(JSON.stringify(data)),
          previousProps: params.props,
        }),
      );
    } else {
      params.dispatch(
        dataConfig.dataActionHandler({
          uri: dataConfig.uri,
          fetchStatus: FetchStatus.Done,
          dataStatus: DataStatus.Error,
          value: data,
          previousProps: params.props,
        }),
      );
    }
  }

  return data;
};

export default handleOnError;
