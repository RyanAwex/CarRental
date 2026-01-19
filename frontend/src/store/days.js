export const getPrice = (item) => {
  const todayIndex = new Date().getDay();
  const isWeekend = todayIndex === 0 || todayIndex === 6;

  return isWeekend ? item.weekend_price_per_day : item.base_price_per_day;
};
