import { animate, MotionValue, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';

const inactiveShadow = '0 2px 1px rgb(0, 0, 0, 0.08)';

export function useNoteShadow(value: MotionValue<number>) {
  const boxShadow = useMotionValue(inactiveShadow);

  useEffect(() => {
    let isActive = false;
    value.onChange((latest) => {
      const wasActive = isActive;
      if (latest !== 0) {
        isActive = true;
        if (isActive !== wasActive) {
          animate(boxShadow, '5px 5px 10px rgb(0, 0, 0, 0.2)');
        }
      } else {
        isActive = false;
        if (isActive !== wasActive) {
          animate(boxShadow, inactiveShadow);
        }
      }
    });
  }, [value, boxShadow]);

  return boxShadow;
}
