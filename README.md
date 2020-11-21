# Redux Fetcher Compose

[![Redux Fetcher Compose NPM version](https://badgen.net/npm/v/redux-fetcher-compose)](https://www.npmjs.com/package/redux-fetcher-compose)
[![Redux Fetcher Compose package size](https://badgen.net/bundlephobia/minzip/redux-fetcher-compose)](https://bundlephobia.com/result?p=redux-fetcher-compose)
![Redux Fetcher Compose license](https://badgen.net/npm/license/redux-fetcher-compose)
![Redux Fetcher Compose types](https://badgen.net/npm/types/tslib)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**Redux Fetcher Compose is a library for data fetching and integrate [@reduxjs/toolkit](https://redux-toolkit.js.org) for React application**

It features:

- Support Hooks, React Component, and Redux action to fetch and get data from API.
- Auto init reducer and action. It means, you not must declare a reducer to store response data.
- Support autosave response data to reducer base on URI (caching and prevent DRY code).
- Support transform response data getter.
- Support [Abort Controller](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) to abort request after unmount or client timeout.
- TypeScript ready.
- Support helper checks the status of data and requests.
- Add more hooks to trigger the request event.
- Can set timeout and parse the response for each request.
- Refetch request with previous props.
- All features supported by [@reduxjs/toolkit](https://redux-toolkit.js.org)

...and a lot more.

## Usage

Inside your React project directory, run the following:

```shell
yarn add redux-fetcher-compose
```

Or with npm:

```shell
npm install redux-fetcher-compose
```

## Quick Start

You can checkout example at [CodeSandbox](https://codesandbox.io/s/simple-use-redux-fetcher-compose-ed4l5)

`fetcher.ts`

```typescript
import {
  createFetcher,
  createService,
  ResponseParsed,
} from 'redux-fetcher-compose'

interface ExampleFetcherProps {
  type: string
}

interface Post {
  id: string
  name: string
  description: string
}

type RootState = any // Root reducers type;

const serviceCommon = createService({
  domain: 'https://example.com/api',
  requestTimeout: 10000
})

const ENTRY_POINT = 'example'

const fetcher = createFetcher<
  ExampleFetcherProps,
  RootState,
  ResponseParsed<Post[]>,
>({
  id: 'Example',
  shouldKeepData: true,
  uri: ({ props }) => props.type,
  service: serviceCommon,
  requestInfo: () => {
    return {
      entry: ENTRY_POINT,
      options: {
        method: 'GET',
      },
    }
  },
})

export const {
  action: getExampleAction,
  component: ExampleFetcher,
  useFetcherCompose: useExampleFetcherCompose,
  useGetter: useExampleGetter,
  useFetcher: useExampleFetcher
} = fetcher
```

`App.tsx`

```tsx
import React from 'react'
import {
  createAppState,
  DataProvider
} from 'redux-fetcher-compose'
import { useExampleFetcherCompose } from './fetcher.ts'

const appState = createAppState({
  enableReduxDevTools: true,
  reducers: {}, // Root reducers
  initialState: {},
})

export default function App () {
  const [getter, refetch, abortController] = useExampleFetcherCompose({
    type: 'news'
  })

  const handleRefetch = () => {
    refetch()
  }

  return (
    <DataProvider appState={appState}>
      <h1>Hello Redux Fetcher Compose</h1>
      <button onClick={handleRefetch}>Refetch</button>
      <p>Fetcher data: {JSON.stringify(getter)}</p>
    </DataProvider>
  )
}
```

## API

### createAppState

The function to create Redux store and app state context.

```typescript
const appState = createAppState(options)
```

#### Parameters

- `options`: an object of config React Redux.
  - `enableReduxDevTools: boolean = false`: (optional) whether to enable Redux DevTools integration.
  - `reducers: ReducersMapObject = {}`: (optional) a single reducer function that will be used as the root reducer.
  - `initialState: Object = {}`: (optional) an initial state value to be passed to the Redux createStore function.
  - `middleware = []`: (optional) an array of Redux middleware to install.

#### Return values

- `store`: the store of Redux, it's enhanced some feature to use for fetcher.
- `appStateContext`: the value of React context.
  - `enhancedStore`: the Redux store.
  - `dispatch`: the function to dispatch Redux action.

### DataProvider

The React component to wrap all components of the application to used Redux.

```tsx
<DataProvider appState={appState}>
  <App />
</DataProvider>
```

#### Props

- `appState`: the app state created by `createAppState` function.
- `children`: the React component children.

### AppStateContext

The React context

```tsx
import { useContext } from 'react'

const appStateContext = useContext(AppStateContext)
```

#### Return values

- `enhancedStore`: the Redux store.
- `dispatch`: the function to dispatch Redux action.

### useStore

This React hook returns a reference to the same Redux store that was passed into the `<DataProvider>` component.

```tsx
  const enhancedStore = useStore()
```

### createService

The function to create a request service. It's can config API domain, request timeout, parse response of request, pass request options. Moreover, it provides some hooks to trigger events: pre-request, request success, request error. The return value of the function used in the fetcher config as a parameter.

```typescript
const service  = createService(options);
```

#### Parameters

- `options`: the object to config service.
  - `domain: string = undefined`: (optional) the base domain to request API.
  - `requestTimeout: number = undefined`: (optional) set time (millisecond) to set timeout for request.
  - `responseParser: ResponseParser = defaultResponseParser`: the function to parse response. It's decide response of request is success or error.
  - `optionsModifier: OptionModifier = undefined`: the function to modify request options default.
  - `preRequestHook: FnPreRequestHook = undefined`: the function to trigger pre request called.
  - `requestSuccessHook: FnRequestSuccessHook = undefined`: the function to trigger response succeed.
  - `requestErrorHook: FnRequestErrorHook = undefined`: the function to trigger response error.


#### Return values

- `service: Service`: the function to use in fetcher config.

#### Types

- `ResponseParser`: (response) => Promise
- `OptionModifier`: (options) => RequestOptions
  - `options`: { getAppStateContext, requestInfo }
- `FnPreRequestHook`: (options) => void
  - `options`: { getAppStateContext, requestInfo, options }
- `FnRequestSuccessHook`: (options) => void
  - `options`: { getAppStateContext, requestInfo, options, responseParsed }
- `FnRequestErrorHook`: (options) => void
  - `options`: { getAppStateContext, requestInfo, options, responseParsed }

### createFetcher

The function is used to define a fetcher. It's will create fetcher action, fetcher component, some hooks such as useFetcher, useGetter, useFetcherCompose.

```typescript
/**
 * @generator {FP}: Fetcher prop
 * @generator {RS}: Root state,
 * @generator {R}: Response,
 * @generator {TR}: Transform response
 * @param config
 */
const fetcher = createFetcher<FP, RS = any, R = any, TR = R>(config);
```

#### Parameters

- `config`: the configuration object of fetcher.
  - `id: string = undefined`: (optional) the id of the fetcher. It's used to create a  reducer to store response parsed. The field is optional, but if you want to use getter,  that must be required.
  - `shouldKeepData: boolean = false`: (optional) the option help you keep fetcher data when component has use fetcher. It just work when you use useFetcher, useFetcherCompose, fetcher component.
  - `uri: FnFetcherURI = undefined`: (optional) the path to store response data in fetcher reducer. It useful when you call fetcher at many different contexts. Default fetcher will auto created path is `@`.
  - `service: Service`: it service that fetcher used. Created by `createService`.
  - `requestInfo: FnFetcherRequestInfo`: the function help declare are config of a request such as: domain, query, timeout, entry point, request options.
  - `shouldFetch: FnFetcherShouldFetch =  defaultShouldFetch`: (optional) the function decided request call or not call. Default return true if the first call or current props different with previous props.
  - `preHandler: FnFetcherPreHandler = undefined`: (optional) the function will trigger before request called.
  - `onPending: FnFetcherOnPendingHandler = defaultOnPending`: (optional) the function will trigger while requesting API.
  - `onSuccess: FnFetcherOnSuccessHandler = defaultOnSuccess`: (optional) the function will trigger when response parsed was succeed.
  - `onError: FnFetcherOnErrorHandler = defaultOnError`: (optional) the function will trigger when response parsed was error.

#### Return values

- `action`: Redux action. When action dispatched then requesting API.
- `component`: the React component. When component mounted then requesting API. But call or not call rely on the value returned of the `shouldFetch` function.
- `useFetcher`: the React hook to help you requesting API. But call or not call rely on the value returned of the `shouldFetch` function.
- `useGetter`: the React hook to help you get info of a request called stored in reducer base on `uri`.
- `useFetcherCompose`: the React hook that compose  `useFetcher` and `useGetter`.

#### Types

- `FnFetcherURI`: ({ props, getState }) => string;
  - `props`: Props to pass when use fetcher instance.
  - `getState`: Get state of root reducer.
- `Service`: ({ getAppStateContext, requestInfo, abortController, onPending, onSuccess, onError }) => Promise
- `FnFetcherRequestInfo`: (props, getAppStateContext) => RequestInfo
- `RequestInfo`: is a object.
  - `domain?`: string
  - `query?`: string | {}
  - `timeout?`: number
  - `entry`: string
  - `options`: RequestInit
- `FnFetcherShouldFetch`: ({ props, state, localState} ) => boolean;
  - `state`: is a root state.
  - `localState`: is a state of fetcher base on `uri`.
- `FnFetcherPreHandler`: ({ props, getState, getAppStateContext, dispatch, localState }) => void
- `FnFetcherOnPendingHandler`: ({ props, requestInfo, getState, localState, getAppStateContext, dispatch }) => any
- `FnFetcherOnSuccessHandler`: ({ props, requestInfo, getState, localState, getAppStateContext, dispatch }) => TR | R
- `FnFetcherOnErrorHandler`: ({ props, requestInfo, error, localState, getState, getAppStateContext, dispatch }) => TR | R

### Fetcher values returned

#### Action

```typescript
action: (props?: FP, abortController?: AbortController ) => any
```

- `props`: is a prop to pass in fetcher.
- `abortController`: is a instance of `new AbortController()`
- When you dispatch action will return value, that returned `onSuccess` or `onError` function that pass to config fetcher.

#### useFetcher

 ```typescript
  const [refetch, abortController] = useFetcher(props?: FP, defer?: boolean);
```

- Hook params:
  - `props`: is a props will pass to fetcher.
  - `defer`: If set `true` then will not request API when  hook mounted.
- Hook return value:
  - `refetch` is a function to refetch API: `(newProps? FP) => TR`
  - `abortController` is a instance of AbortController.

#### useGetter

```typescript
const getter = useGetter(props?: FP, transform?: (getter) => { ... })
```

- Hook params:
  - `props`: is a props will pass to fetcher.
  - `transform`: is a function to transform data before return.
- Hook return one object include properties:
  - `fetchStatus`: is a fetch status.
  - `dataStatus`: is a fetcher data status.
  - `value`: is a value returned by `onPending`, `onSuccess` or `onError`
  - `previous`: is a previous getter after one action dispatched to change getter data.
  - `currentProps`: is current props to passed in fetcher.
  - `previousProps`: is previous props to passed in fetcher.
  - `isStatus`: is a function to check status of request

    ```typescript
    isStatus: (dataStatus: DataStatus) => boolean;
    ```

  - `isLoading`: it is `true`: API requesting.

#### useFetcherCompose

 ```typescript
  const [getter, refetch, abortController] = useFetcherCompose(props?: FP, transform?: (getter) => { ... });
```

- Hook params:
  - `props`: is a props will pass to fetcher.
  - `defer`: If set `true` then will not request API when  hook mounted.
- Hook return value:
  - `getter` is a value returned by transform function. It a object same value returned by `useGetter` hook.
  - `refetch` is a function to refetch API: `(newProps? FP) => TR`
  - `abortController` is a instance of AbortController.

#### Component

 ```tsx
  <Component {...props} transform={(getter) => { ... }}>
    <SomethingComponent />
  </Component>
  ```

- `Component` will pass all props into fetcher.
- `Component` has specific prop is `transform`.

    ```typescript
    transform: (getter) => {...}
    ```

- `SomethingComponent` will passed two props: `getter` and `refetch`.
  - `getter` is a value returned by transform function. It a object same value returned by `useGetter` hook.
  - `refetch` is a function to refetch API: `(newProps? FP) => TR`

### defaultShouldFetch

The function to check should fetch or shouldn't fetch API. By check, fetch data status is initial or previous props different current props.

### Some enums

#### DataStatus

The status of fetcher data.

- `Initial`: is the initial state.
- `Initializing`: pending on the first request.
- `Initialized`: done on the first request.
- `Updating`: pending since the first request.
- `Updated`: done since the first request.
- `Loading`: is requesting.
- `Error`: the response was an error.
- `Success`: the response was succeeded.
- `Aborted`: the response was aborted.
- `Timeout`: the response timeout.

#### FetchStatus

The status of the request.

- `Init`
- `Pending`
- `Done`
- `Aborted`
- `Timeout`

### Some helpers

#### parseQuery

The function using the `qs` library. Help you parse query string to object with default `ignoreQueryPrefix = true`.

```typescript
const queryObject = parseQuery(query: string, options: IParseOptions)
```

#### stringifyQuery

The function using the `qs` library. Help you parse query string to object with default `addQueryPrefix = true`.

```typescript
const queryString = stringifyQuery(query: Object, options: IStringifyOptions)
```

### Some interfaces

- `Service`
- `FnFetcherShouldFetch`
- `FnFetcherPreHandler`
- `FnFetcherRequestInfo`
- `FnFetcherURI`
- `FnFetcherOnPendingHandler`
- `FnFetcherOnSuccessHandler`
- `FnFetcherOnErrorHandler`
- `ResponseParsed`

### And export all modules of `@reduxjs/toolkit` library

## Versioning

Use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/quinhatpy/redux-fetcher-compose/tags).

## Author

![](https://avatars3.githubusercontent.com/u/16174862?s=60&v=4) **Lê Quí Nhất** - quinhatpy@gmail.com
