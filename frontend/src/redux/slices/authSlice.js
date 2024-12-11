import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import Cookies from 'js-cookie';

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      Cookies.set('token', response.token, { expires: 1 });
      Cookies.set('user', JSON.stringify(response.user), { expires: 1 });
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      Cookies.set('token', response.token, { expires: 1 });
      Cookies.set('user', JSON.stringify(response.user), { expires: 1 });
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    Cookies.remove('token');
    Cookies.remove('user');
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
    token: Cookies.get('token') || null,
    isAuthenticated: !!Cookies.get('token'),
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;