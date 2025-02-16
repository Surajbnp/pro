const formatNumber = (num) => {
  if (num < 100000) {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  } else if (num < 1000000) {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  } else {
    return (num / 1000000).toFixed(3).replace(".", ".") + " M";
  }
};

export default formatNumber;
