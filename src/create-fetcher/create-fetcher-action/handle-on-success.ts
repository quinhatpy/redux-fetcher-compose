import { DataStatus, FetchStatus } from '../../constant/enum';
import { FetcherSuccessArgs, OnSuccessHandlerArgs } from '../../interfaces';

const defaultOnSuccess = <FP, RS, R, TR>(
  onSuccessParams: FetcherSuccessArgs<FP, RS, R, TR>,
): TR | R => {
  return onSuccessParams.res;
};

const handleOnSuccess = <FP, RS, R, TR>({
  config,
  params,
  dataConfig,
}: OnSuccessHandlerArgs<FP, RS, R, TR>) => {
  const onSuccess = config.onSuccess ?? defaultOnSuccess;

  const data = onSuccess(params);

  if (dataConfig.dataActionHandler instanceof Function) {
    params.dispatch(
      dataConfig.dataActionHandler({
        uri: dataConfig.uri,
        fetchStatus: FetchStatus.Done,
        dataStatus: DataStatus.Success,
        value: data,
        previousProps: params.props,
      }),
    );
  }

  return data;
};

export default handleOnSuccess;
