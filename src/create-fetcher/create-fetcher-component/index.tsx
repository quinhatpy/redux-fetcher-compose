import React, { cloneElement, PropsWithChildren } from 'react';

import {
  FetcherComponent,
  GetterData,
  UseFetcherCompose,
} from '../../interfaces';

const creatFetcherComponent = <FP, TR>(
  useFetcherCompose: UseFetcherCompose<FP, TR>,
): FetcherComponent<FP, TR> => {
  const Fetcher = ({
    children,
    transform,
    ...props
  }: PropsWithChildren<
    FP & { transform?: (getter: GetterData<FP, TR>) => any }
  >) => {
    const [getter, refetch] = useFetcherCompose(props as FP, transform);

    if (!children) {
      return null;
    }

    const childrenWithProps = React.Children.map(children, (child) => {
      return cloneElement(child as any, {
        getter,
        refetch,
      });
    });

    return childrenWithProps;
  };

  return Fetcher as any;
};

export default creatFetcherComponent;
