const addZeroes = (number: number) =>
  number.toLocaleString("en", { useGrouping: false, minimumFractionDigits: 2 });

export default addZeroes;
