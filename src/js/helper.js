const dayShort = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
const dayLong = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
const monthShort = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
const monthLong = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

export const dateFormat = (date, format) => {
  let result = format;

  // Replacing the date or day
  result = result.replace(/dddd/g, dayLong[date.getDay()]);
  result = result.replace(/ddd/g, dayShort[date.getDay()]);
  result = result.replace(/dd/g, padNumber(date.getDate()));
  result = result.replace(/d/g, date.getDate());

  // Replacing the month
  result = result.replace(/MMMM/g, monthLong[date.getMonth()]);
  result = result.replace(/MMM/g, monthShort[date.getMonth()]);
  result = result.replace(/MM/g, padNumber(date.getMonth()));
  result = result.replace(/M/g, date.getMonth());
  
  // Replacing the year
  result = result.replace(/yyyy/g, date.getFullYear());
  result = result.replace(/yy/g, date.getYear().toString().substring(2));
  
  // Formatting the hour minute and second
  result = result.replace(/HH/g, padNumber(date.getHours()));
  result = result.replace(/mm/g, padNumber(date.getMinutes()));
  result = result.replace(/ss/g, padNumber(date.getSeconds()));

  return result;
}
// Padding a number with provided char and final length of the number
export const padNumber = (num, char = '0', pad = 2) => {
  // Conver the number to string
  let result = num.toString();
  // Padding the result with the char provided
  while (result.length < pad) {
    result = `${char}${result}`;
  }

  return result;
}