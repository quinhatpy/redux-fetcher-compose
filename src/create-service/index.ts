import { CreateServiceArgs, ResponseParser, ServiceArgs } from '../interfaces';
import { fetchWithTimeout, defaultResponseParser } from './helpers';
import { parseQuery, stringifyQuery } from '../helpers/qs';

const createService = ({
  domain,
  requestTimeout,
  responseParser = defaultResponseParser as ResponseParser,
  optionsModifier,
  preRequestHook,
  requestSuccessHook,
  requestErrorHook,
}: CreateServiceArgs) => {
  const service = async <R>({
    requestInfo,
    getAppStateContext,
    onPending,
    onSuccess,
    onError,
    abortController,
  }: ServiceArgs<R>): Promise<any> => {
    const signal = abortController.signal;

    const options: RequestInit = {
      headers: {},
      ...requestInfo.options,
      signal,
    };

    if (options.body) {
      if (
        typeof options.body === 'object' &&
        !(options.body instanceof FormData)
      ) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }
    }

    const nextRequestInfo = {
      timeout: requestTimeout,
      ...requestInfo,
      options,
    };

    const optionsModified =
      optionsModifier instanceof Function
        ? optionsModifier({
            getAppStateContext,
            requestInfo: nextRequestInfo,
          })
        : options;

    onPending();

    if (preRequestHook instanceof Function) {
      preRequestHook({
        getAppStateContext,
        requestInfo: nextRequestInfo,
        options: optionsModified,
      });
    }

    try {
      const nextQueryInfo = requestInfo.query || {};
      const queryObject =
        typeof nextQueryInfo === 'string'
          ? parseQuery(nextQueryInfo)
          : nextQueryInfo;
      const queryStringified = stringifyQuery(queryObject);
      const entryPoint = `${requestInfo.entry}${queryStringified}`;
      const nextDomain = requestInfo.domain || domain;
      const url = new URL(entryPoint, nextDomain);

      const response = await fetchWithTimeout({
        url,
        options: optionsModified,
        requestInfo: nextRequestInfo,
        abortController,
      });

      const responseParsed = await responseParser<R>(response);

      if (requestSuccessHook instanceof Function) {
        requestSuccessHook({
          getAppStateContext,
          requestInfo: nextRequestInfo,
          options: optionsModified,
          responseParsed,
        });
      }
      return onSuccess(responseParsed);
    } catch (error) {
      let errorData = null;

      if (typeof error.success === 'undefined') {
        errorData = {
          success: false,
          httpStatus: 500,
          error,
          message: error.message,
        };
      } else {
        errorData = error;
      }
      if (requestErrorHook instanceof Function) {
        requestErrorHook({
          getAppStateContext,
          requestInfo: nextRequestInfo,
          options: optionsModified,
          responseParsed: errorData,
        });
      }

      return onError(errorData);
    }
  };

  return service;
};

export default createService;
