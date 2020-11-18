import { ERROR_MESSAGE_SYSTEM } from '../constant/const';
import { FetchWithTimeoutArgs, ResponseParsed } from '../interfaces';

export const fetchWithTimeout = ({
  url,
  options,
  requestInfo,
  abortController,
}: FetchWithTimeoutArgs): Promise<Response> => {
  const { timeout } = requestInfo;

  return new Promise(async (resolve, reject) => {
    const timeoutTimer = !!timeout
      ? setTimeout(() => {
          timeoutTimer && clearTimeout(timeoutTimer);
          abortController.abort();

          reject({
            success: false,
            httpStatus: 499,
            url,
            requestInfo,
            option: {
              ...options,
              signal: undefined,
            },
            message: 'Network timeout',
          });
        }, timeout)
      : null;

    try {
      const request = new Request(url.href, options);
      const response = await fetch(request);

      timeoutTimer && clearTimeout(timeoutTimer);
      resolve(response);
    } catch (ex) {
      timeoutTimer && clearTimeout(timeoutTimer);
      reject(ex);
    }
  });
};

export const defaultResponseParser = async (
  response: Response,
): Promise<ResponseParsed> => {
  const { status, ok } = response;

  if (status >= 500) {
    throw {
      success: false,
      httpStatus: status,
      message: ERROR_MESSAGE_SYSTEM,
    };
  }

  try {
    const json = await response.json();

    if (ok) {
      return {
        success: true,
        httpStatus: status,
        message: json?.message,
        result: json,
        error: undefined,
      };
    } else if ([400, 401, 403, 404].includes(status)) {
      throw {
        success: false,
        httpStatus: status,
        message: json?.message || ERROR_MESSAGE_SYSTEM,
        error: json,
      };
    }

    throw {
      success: false,
      httpStatus: status,
      message: response.statusText || ERROR_MESSAGE_SYSTEM,
    };
  } catch (exception) {
    throw {
      success: false,
      httpStatus: status,
      message: response.statusText || ERROR_MESSAGE_SYSTEM,
      error: JSON.parse(JSON.stringify(exception)),
    };
  }
};
