import axios from 'axios';
import router from '../router/index';
import { logout } from './helper';

const api = axios.create({
  baseURL: 'https://samuel-test.reeqzan.com/api'
})

export const get = async (endpoint) => {
  try {
    let result = await api.get(endpoint, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return result.data;
  } catch (ex) {
    // Checking if the status is unathorized (Meaning that the access token is already expired)
    if (ex.response.status == 401) {
      // Refresh the token
      let refresh = await refreshToken();
      // If refresh token success, re-run the method
      if (refresh) {
        return await get(endpoint);
      }
    }
  }
}

export const post = async (endpoint, data) => {
  try {
    let result = await api.post(endpoint, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return result.data;
  } catch (ex) {
    // Checking if the status is unathorized (Meaning that the access token is already expired)
    if (ex.response.status == 401) {
      // Refresh the token
      let refresh = await refreshToken();
      // If refresh token success, re-run the method
      if (refresh) {
        return await post(endpoint, data);
      }
    }
  }
}

export const put = async (endpoint, data) => {
  try {
    let result = await api.put(endpoint, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return result.data;
  } catch (ex) {
    // Checking if the status is unathorized (Meaning that the access token is already expired)
    if (ex.response.status == 401) {
      // Refresh the token
      let refresh = await refreshToken();
      // If refresh token success, re-run the method
      if (refresh) {
        return await put(endpoint, data);
      }
    }
  }
}

export const httpDelete = async (endpoint) => {
  try {
    let result = await api.delete(endpoint, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return result;
  } catch (ex) {
    // Checking if the status is unathorized (Meaning that the access token is already expired)
    if (ex.response.status == 401) {
      // Refresh the token
      let refresh = await refreshToken();
      // If refresh token success, re-run the method
      if (refresh) {
        return await httpDelete(endpoint);
      }
    }
  }
}

const refreshToken = async () => {
  // Post to refresh the token
  let result = await post('Auth/RefreshToken', {
    access_token: localStorage.getItem('token'),
    refresh_token: localStorage.getItem('refresh')
  });

  // Checking the result
  if (result.success) {
    // Reset the token and refresh token to the new one
    localStorage.setItem('token', result.access_Token);
    localStorage.setItem('refresh', result.refresh_Token);
  } else {
    // Clear the details in localstorage and push to login page
    logout();
    router.push('/');
  }

  // Return whether the refresh is success or not
  return result.success;
}