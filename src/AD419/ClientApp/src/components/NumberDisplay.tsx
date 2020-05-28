import React from 'react';

interface Props {
  value: number;
  precision: number;
}

// format negative numbers as (num) to required preceision
export default function NumberDisplay(props: Props): JSX.Element {
  const displayValue = React.useMemo<string>(() => {
    if (props.value < 0) {
      return `(${(-1 * props.value).toFixed(props.precision)})`;
    }
    return props.value.toFixed(props.precision);
  }, [props.precision, props.value]);

  return <>{displayValue}</>;
}
