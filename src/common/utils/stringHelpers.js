export const truncateString = (string, max) => {
  if (string.length > max) {
    return string.slice(0, max - 3) + '...';
  }
  return string;
};
