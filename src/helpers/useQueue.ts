export const useQueue = <T>(queue: T[]) => {
  let current = 0;

  const advance = (): T => {
    if (current >= queue.length) {
      throw new Error('Unexpected end of input');
    }
    return queue[current++];
  };

  const peek = (): T => {
    if (current >= queue.length) {
      throw new Error('Unexpected end of input');
    }
    return queue[current];
  };

  const hasMore = (): boolean => {
    return current < queue.length;
  };

  const reset = () => {
    queue = [];
    current = 0;
  };

  const position = () => current;

  return {
    advance,
    peek,
    hasMore,
    position,
    reset,
  };
};
