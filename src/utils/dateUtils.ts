export const getYearOptions = (startYear = 2000) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = startYear; y <= currentYear + 1; y++) {
    years.push({ label: String(y), value: y });
  }
  return years.reverse();
};
