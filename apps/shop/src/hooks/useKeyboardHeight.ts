/**
 * useKeyboardHeight - 모바일 키보드 높이 감지 훅
 *
 * visualViewport API를 사용하여 키보드가 올라왔을 때의 높이를 감지합니다.
 * 바텀시트가 키보드 위로 올라가도록 하는 데 사용됩니다.
 *
 * Usage:
 * const keyboardHeight = useKeyboardHeight();
 * <BottomSheet style={{ bottom: keyboardHeight }} />
 */

import { useEffect, useState } from 'react';

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      // viewport.height가 window.innerHeight보다 작으면 키보드가 올라온 것
      const heightDiff = window.innerHeight - viewport.height;
      setKeyboardHeight(Math.max(0, heightDiff));
    };

    // 초기값 설정
    handleResize();

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  return keyboardHeight;
}
