import axios from "axios";
 
const axiosInstance = axios.create({
  baseURL: 'https://be-stiqr.dnstech.co.id/api/',
});
 
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    console.log(token)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
 
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      // (error.response.data.error === "Your email address is not verified." ||
      //   error.response.status === 401)
      error.response.data.error === "Your email address is not verified."
    ) {
      const event = new CustomEvent("session-expired");
      window.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);
 
export default axiosInstance;
 