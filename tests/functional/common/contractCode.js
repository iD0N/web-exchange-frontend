const monthToLetter = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'];

const getUTC = () => {
  const now = new Date();
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000);
};

module.exports = function(contract) {
  const utc = getUTC();
  const letter = monthToLetter[utc.getMonth()];
  const year = utc
    .getFullYear()
    .toString()
    .slice(-2);

  return `${contract}${letter}${year}`;
};
