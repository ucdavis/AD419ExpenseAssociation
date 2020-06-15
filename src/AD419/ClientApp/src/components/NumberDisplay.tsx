import React from 'react';

interface Props {
  value: number;
  precision: number;
  type?: string;
}

// format negative numbers as (num) to required preceision
export default function NumberDisplay(props: Props): JSX.Element {
  const displayValue = React.useMemo<string>(() => {
    if (props.type === 'currency') {
      const currencyVal = Math.abs(props.value).toLocaleString('en', {
        style: 'currency',
        currency: 'USD',
      });

      return props.value < 0 ? `(${currencyVal})` : currencyVal;
    } else {
      // just use default number display
      const numFixed = Math.abs(props.value).toLocaleString('en', {
        minimumFractionDigits: props.precision,
      });

      return props.value < 0 ? `(${numFixed})` : numFixed;
    }
  }, [props.precision, props.type, props.value]);

  return <>{displayValue}</>;
}
