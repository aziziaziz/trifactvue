import axios from 'axios';

const api = axios.create({
  baseURL: 'https://samuel-test.reeqzan.com/api'
})

export const get = async (endpoint) => {
  let result = await api.get(endpoint);
  return result.data;
}