import { HubConnectionBuilder } from '@microsoft/signalr';
import store from '../store/index';

const dayShort = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
const dayLong = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
const monthShort = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
const monthLong = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

let questionSub = null; // Set the default question subscribe

// Hub details enum
export const hubDetails = {
  BUILDINGHUBNAME: 'buildingSelectionHub',
  BUILDINGEXTENDTIME: 'ShareTimeExtended'
}

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
  result = result.replace(/MM/g, padNumber(date.getMonth() + 1));
  result = result.replace(/M/g, date.getMonth() + 1);
  
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
  // Convert the number to string
  let result = num.toString();
  // Padding the result with the char provided
  while (result.length < pad) {
    result = `${char}${result}`;
  }

  return result;
}
// Round a number to a certain decimal places
export const roundNumber = (num, decimal) => {
  num = Number(num);
  decimal = Number(decimal);
  
  if ((!isNaN(num) || !num == undefined) || !isNaN(decimal) || !decimal == undefined) {
    return Math.round(num * Math.pow(10, decimal)) / Math.pow(10, decimal);
  } else {
    console.error(`num: (${num}) OR decimal: (${decimal}) is not a number or undefined`);
    return 0;
  }
}
// To fake waiting
export const wait = (time) => { // Time in milliseconds
  return new Promise(r => setTimeout(() => r(), time));
}
// To assign action when posting
export const compareData = (oriObj, newObj, compareKey) => {
  // Getting the details of the object with the updated or inserted action
  let objToPost = newObj.value.map(newitem => {
    // Checking if the current exists in ori
    let exists = oriObj.value.find(ori => newitem[compareKey] == ori[compareKey]);
    if (exists) { // If exists, need to compare all the values and update
      if (JSON.stringify(newitem) != JSON.stringify(exists)) {// Comparing the new item and ori if it is different
        // Setting the action to U for update
        let obj = JSON.parse(JSON.stringify(newitem));
        obj.action = 'U'
        return obj;
      } else {
        return null;
      }
    } else { // Insert a new value
      // Setting the action to I for insert
      let obj = JSON.parse(JSON.stringify(newitem));
      obj.action = 'I'
      return obj;
    }
  }).filter(p => p);

  // Getting the details of the spaces that has been deleted
  let deletedObj = oriObj.value.map(ori => {
    // Finding the one in ori that is in the current
    let deleted = newObj.value.find(space => space[compareKey] == ori[compareKey]);
    if (!deleted) { // If does not exists set the action to D
      let obj = JSON.parse(JSON.stringify(ori));
      obj.action = 'D'
      return obj;
    } else { // If exists, do nothing
      return null;
    }
  }).filter(d => d);

  // Adding the deleted obj into the return obj
  objToPost.push(...deletedObj);

  return objToPost;
}
// To call the generic popup from the App
export const popup = (header, content) => {
  // Commit the show popup with header and content (Return a default value for the header and content if not passed)
  store.commit('showAlert', {
    header: header || 'Header not set',
    content: content || 'Content not set'
  });
}
// To call the generic popup from the App
export const question = (header, content, yesText, noText, isDestructive) => {
  // Set the resolve obj to from the promise so that this method is awaitable
  let resolve = null;
  let prom = new Promise(r => resolve = r);

  // Commit the show popup with header and content (Return a default value for the header and content if not passed)
  store.commit('showAlertQuestion', {
    header: header || 'Header not set',
    content: content || 'Content not set',
    yesText: yesText || 'Yes',
    noText: noText || 'No',
    isDestructive: isDestructive == undefined || isDestructive == null ? false : true
  });

  // Unsubscribe if it is already subscribe
  if (questionSub) {
    questionSub();
  }

  // Subscribe when the button in the popup is clicked (either yes/no)
  questionSub = store.subscribe((mutation) => {
    if (mutation.type == 'questionAnswered') {
      resolve(mutation.payload.answer);
    }
  });

  return prom;
}
// To show notification
export const showNoti = (text, theme, expires) => {
  // Commit the show notification mutation from store
  store.commit('showNoti', {
    text: text || 'Notification text not set',
    expires: expires || 3000,
    theme: theme || 'default'
  });
}
// To find a difference between 2 dates
export const dateDiff = (date1, date2) => {
  // let totalMillis = date1.getTime() - date2.getTime();
  let totalMillis = date1.getTime() - date2.getTime();

  // The milliseconds
  let millis = totalMillis % 1000;

  // Getting the hours
  let fullHours = totalMillis / 1000 / 60 / 60;
  let hours = Math.floor(fullHours);

  // Getting the minutes
  let fullMinute = (fullHours - hours) * 60;
  let minute = Math.floor(fullMinute);

  // Getting the seconds
  let fullSecond = (fullMinute - minute) * 60;
  let second = Math.floor(fullSecond);
  
  return {
    hours: hours,
    minute: minute,
    second: second,
    millis: millis,
    fullText: () => {
      let text = [];
      if (hours > 0) {
        text.push(`${hours} ${hours > 1 ? 'Hours' : 'Hour'}`);
      }
      if (minute > 0) {
        text.push(`${minute} ${minute > 1 ? 'Minutes' : 'Minute'}`);
      }
      if (second > 0) {
        text.push(`${second} ${second > 1 ? 'Seconds' : 'Second'}`);
      }

      return text.join(' ');
    }
  }
}
// To build the connection hub to the SignalR
export const buildSignalR = (hubName) => {
  // Build the hub
  let hub = new HubConnectionBuilder().withUrl(`https://samuel-test.reeqzan.com/${hubName}`).build();
  return hub;
}
export const logout = () => {
  // To clear all the user details upon logout from the local storage
  localStorage.removeItem('user');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('client');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
  localStorage.removeItem('userid');
  localStorage.removeItem('role');

  // Clearing from the store
  store.state.currentClient = '';
}
// To be used to convert number to a currency formatted
export const formatNumber = (num, separator = ',', decimal = 2) => {
  // Checking if num is really a number
  if (isNaN(Number(num))) {
    console.error(`formatNumber: ${num} - is not a number`);
    return 0;
  }

  // Rounde the number first
  num = roundNumber(num, decimal);
  // Split the num to get the whole nunber and the decimal number
  let numSplit = num.toString().split('.');
  let wholeNum = numSplit[0];
  let decimalNum = numSplit[1] || '0';

  // Splitting the whole number
  let wholeNumSplit = wholeNum.split('').reverse();

  // Set the result to empty array
  let result = [];
  for (let x = 0; x < wholeNumSplit.length; x += 3) {
    // Slice and reverse
    result.push(wholeNumSplit.slice(x, x + 3).reverse().join(''));
  }

  // Reverse the array since the last inserted is the first value
  result.reverse();

  // Return the result
  return `${result.join(separator)}.${decimalNum}${decimalNum.length < 2 ? '0' : ''}`;
}
// To be used to get the number value if the value is already formatted
export const getNumber = (formatted) => {
  // Checking the formatted if there is a value
  if (formatted) {
    // The the digits and dot only
    let allNumber = formatted.match(/\d|\./g);
    
    // Checking if digit and dot is found
    if (allNumber.length > 0) {
      // Return the number value
      return Number(allNumber.join('')) || 0;
    } else {
      // Returning 0 since no digit is found
      return 0;
    }
  } else {
    // Returning 0 if the formatted is null/empty/undefined
    return 0;
  }
}