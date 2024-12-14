export const getTimeOfDay = () => {
  const currentHour = new Date().getHours()

  if (currentHour >= 5 && currentHour < 12) return 'morning'
  if (currentHour >= 12 && currentHour < 18) return 'afternoon'
  return 'evening'
}
