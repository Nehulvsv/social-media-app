import axios from "axios";
import { headers } from "next/headers";


const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create(
  {
    baseURL: API_BASE_URL,
    withCredentials:true

  }

)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original_request = error.config;

    // Check for 401 error and ensure this is not a retry of the token refresh request
    if (error.response?.status === 401 && !original_request._retry) {
      original_request._retry = true;

      try {
        // Attempt to refresh the token
        const refreshResponse = await api.post('/token/refresh/');
        console.log('Token refreshed successfully. Retrying original request...');

        // Update the access token in cookies or headers
        if (refreshResponse.data.access_token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.access_token}`;
        }

        // Retry the original request with the new token
        return api(original_request);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Clear tokens and update the isLoggedIn state
        document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        // Update the isLoggedIn state in the AuthProvider
        window.location.href = '/login'; // Use window.location.href to ensure a full page reload

        throw refreshError;
      }
    }

    // Handle other errors
    throw error;
  }
);


interface Tokens {
  access: string;
  refresh: string;
}

let tokens: Tokens | null = null;

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const response = await api.post('/token/' ,{username,password});
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export async function logout(): Promise<boolean> {
  try {
    const response = await api.post('/logout/' );
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export async function get_auth(): Promise<boolean> {
  try {
    const response = await api.get('/status/');
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export async function register(data: { email: string; password: string; username: string; firstName: string; lastName: string }): Promise<boolean> {
  try {
    const response = await api.post('/register/' ,{data});
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export async function fetchProfile(username): Promise<any> {
  try {
    const response = await api.get(`/my-profile/${username}`);
    return response.data;
  
  } catch (error) {
    console.error('Fetch profile error:', error);
    throw error;
  }
}

export async function toggleFollow(username :  string): Promise<any> {
  try {
    const response = await api.post(`/follow/` , {username});
    return response.data;
  
  } catch (error) {
    console.error('Fetch profile error:', error);
    throw error;
  }
}


export async function fetchPosts(username :  string): Promise<any> {
  try {
    const response = await api.get(`/posts/${username}`);
    return response.data;
  
  } catch (error) {
    console.error('Fetch profile error:', error);
    throw error;
  }
}


export async function toggleLike(id :  number): Promise<any> {
  try {
    const response = await api.post(`/toggle-like` ,{id});
    return response.data;
  
  } catch (error) {
    console.error('Fetch profile error:', error);
    throw error;
  }
}

export async function createPost(content:string): Promise<any> {
  try {
    const response = await api.post(`/create-post` ,{content});
    return response.data;
  
  } catch (error) {
    console.error('error:', error);
    throw error;
  }
}

export async function deletePost(id:number): Promise<any> {
  try {
    const response = await api.delete(`/delete-post/${id}`);
    return response.data;
  
  } catch (error) {
    console.error('error:', error);
    throw error;
  }
}

export async function allPost(page:number): Promise<any> {
  try {
    const response = await api.get(`/all-posts?page=${page}` );
    return response.data;
  
  } catch (error) {
    console.error('error:', error);
    throw error;
  }
}


export async function searchUser(username:string): Promise<any> {
  try {
    const response = await api.get(`/search?query=${username}` );
    return response.data;
  
  } catch (error) {
    console.error('error:', error);
    throw error;
  }
}

export async function updateProfile(data: any): Promise<any> {
  try {
    const response = await api.patch(
      `/update-user`,
      data,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function updatePost(id: number , content: string): Promise<any> {
  try {
    const response = await api.patch(
      `/update-post/${id}`,
      content,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

