import { useEffect } from 'react';

const IntroLoader = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return null;
};

export default IntroLoader;
