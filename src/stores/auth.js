import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  // Compute isAuthenticated based on both token and user existence
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })

  async function login(credentials) {
    try {
      console.log('Attempting login with credentials:', credentials)
      const response = await api.post('/login', credentials)
      console.log('Login response:', response.data)

      if (response.data.status === 1 && response.data.data?.user) {
        const userData = response.data.data.user
        const bearer_token = userData.bearer_token

        if (!bearer_token) {
          console.error('No bearer token in response:', response.data)
          return { success: false, message: 'Invalid login response: No token received' }
        }

        // Update state
        user.value = userData
        token.value = bearer_token

        // Save to localStorage
        localStorage.setItem('token', bearer_token)

        console.log('Login successful, user data:', userData)
        return { success: true, message: 'Login successful' }
      }

      console.error('Login failed:', response.data)
      return {
        success: false,
        message: response.data.message || 'Login failed: Invalid response',
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during login',
      }
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await api.post('/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state
      user.value = null
      token.value = null

      // Clear localStorage
      localStorage.removeItem('token')
    }
  }

  async function fetchUserDetails() {
    if (!token.value) {
      console.log('No token found in store')
      return { success: false, message: 'No token found' }
    }

    try {
      console.log('Fetching user details')
      const response = await api.get('/user')

      if (response.data.status === 1 && response.data.data?.user) {
        console.log('User details fetched successfully:', response.data.data.user)
        // Update user data
        user.value = response.data.data.user
        return { success: true, data: response.data.data }
      }

      console.error('Failed to fetch user details:', response.data)
      // Clear invalid token if the response indicates authentication issues
      if (response.data.status !== 1) {
        token.value = null
        localStorage.removeItem('token')
      }
      return { success: false, message: 'Failed to fetch user details' }
    } catch (error) {
      console.error('Error in fetchUserDetails:', error)
      if (error.response?.status === 401) {
        // Clear invalid token
        token.value = null
        localStorage.removeItem('token')
        return {
          success: false,
          message: 'Session expired. Please log in again.',
        }
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user details',
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    fetchUserDetails,
  }
})
