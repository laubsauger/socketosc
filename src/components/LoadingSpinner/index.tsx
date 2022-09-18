import React from 'react';
import './styles.scss';
import { Spinner } from 'react-bootstrap';

type Props = {
  size?: string
}

const LoadingSpinner = (props:Props) => {
  const { size } = props;

  return (
    <div className={"Spinner w-100 text-center " + (size === 'small' ? '' : 'py-5')}>
      <Spinner animation="border" style={{ width: '5rem', height: '5rem' }} />
    </div>
  )
};

export default LoadingSpinner;