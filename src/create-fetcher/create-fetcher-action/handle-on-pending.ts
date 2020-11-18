import { OnPendingHandlerArgs, FetcherPendingArgs } from '../../interfaces';
import { FetchStatus } from '../../constant/enum';

const defaultOnPending = <FP, SP, RS, TR>(
  onPendingParams: FetcherPendingArgs<FP, RS, TR>,
) => {
  return null;
};

const handleOnPending = <FP, RS, R, TR>({
  config,
  params,
  dataConfig,
}: OnPendingHandlerArgs<FP, RS, R, TR>) => {
  const onPending = config.onPending ?? defaultOnPending;

  const data = onPending(params);

  if (dataConfig.dataActionHandler instanceof Function) {
    params.dispatch(
      dataConfig.dataActionHandler({
        uri: dataConfig.uri,
        fetchStatus: FetchStatus.Pending,
        value: data,
        currentProps: params.props,
      }),
    );
  }

  return data;
};

export default handleOnPending;
