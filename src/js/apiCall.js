import axios from 'axios';

const api = axios.create({
  baseURL: 'https://samuel-test.reeqzan.com/api'
})

export const get = async (endpoint) => {
  let result = await api.get(endpoint);
  return result.data;
}

export const post = async (endpoint, data) => {
  let result = await api.post(endpoint, data);
  return result.data;
}

export const put = async (endpoint, data) => {
  let result = await api.put(endpoint, data);
  return result.data;
}