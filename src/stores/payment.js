import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

export const usePaymentStore = defineStore('payment', () => {
  const $q = useQuasar()
  const authStore = useAuthStore()
  const paymentMethods = ref([])
  const currentSubscription = ref(null)
  const loading = ref(false)
  const subscriptions = ref([])
  const cardDetails = ref(null)

  /**
   * Add a new payment method (credit card)
   * @param {Object} cardDetails - The card details
   * @param {string} cardDetails.card_number - Card number
   * @param {string} cardDetails.card_holder_name - Name on the card
   * @param {string} cardDetails.expiry_date - Expiration date (MM/YY)
   * @param {string} cardDetails.ccv - Card security code
   */
  async function addPaymentMethod(cardDetails) {
    loading.value = true
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      const formData = new FormData()
      formData.append('user_id', authStore.user.id)
      formData.append('card_number', cardDetails.card_number)
      formData.append('card_holder_name', cardDetails.card_holder_name)
      formData.append('expiration_date', cardDetails.expiry_date)
      formData.append('ccv', cardDetails.ccv)

      // Log the request data
      console.log('Payment request data:', {
        user_id: authStore.user.id,
        card_number: cardDetails.card_number,
        card_holder_name: cardDetails.card_holder_name,
        expiration_date: cardDetails.expiry_date,
        ccv: cardDetails.ccv,
      })

      const response = await api.post('/payment/add-card', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.status === 200) {
        $q.notify({
          type: 'positive',
          message: 'Payment method added successfully',
        })
        return { success: true, data: response.data.data }
      }

      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to add payment method',
      })
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Error adding payment method:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to add payment method',
      })
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add payment method',
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Subscribe to a plan
   * @param {string} planId - The ID of the subscription package
   */
  async function subscribeToPlan(planId) {
    loading.value = true
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      // Convert planId to string if it's a number
      const subscriptionId = String(planId)

      const formData = new FormData()
      formData.append('user_id', String(authStore.user.id))
      formData.append('subscription_id', subscriptionId)

      // Log the complete request details
      console.log('Subscription request details:', {
        user_id: authStore.user.id,
        subscription_id: subscriptionId,
        user: {
          ...authStore.user,
          payment_profile_id: authStore.user.payment_profile_id,
          customer_profile_id: authStore.user.customer_profile_id,
          sub_id: authStore.user.sub_id,
        },
        formData: Object.fromEntries(formData.entries()),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Check if user has payment profile
      if (!authStore.user.payment_profile_id) {
        throw new Error('No payment profile found. Please add a payment method first.')
      }

      const response = await api.post('/payment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Log the complete response
      console.log('Subscription response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      })

      if (response.data.success) {
        // Update user data to reflect new subscription
        await authStore.fetchUser()
        return { success: true, data: response.data.data }
      } else {
        console.error('Subscription failed:', {
          response: response.data,
          user: authStore.user,
        })
        return {
          success: false,
          message: response.data.message || 'Failed to process subscription',
        }
      }
    } catch (error) {
      // Log complete error details
      console.error('Subscription error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        user: {
          id: authStore.user?.id,
          payment_profile_id: authStore.user?.payment_profile_id,
          customer_profile_id: authStore.user?.customer_profile_id,
          sub_id: authStore.user?.sub_id,
        },
        request: {
          user_id: authStore.user?.id,
          subscription_id: planId,
        },
      })

      // Return appropriate error message
      if (!authStore.user?.payment_profile_id) {
        return {
          success: false,
          message: 'No payment profile found. Please add a payment method first.',
        }
      }

      return {
        success: false,
        message:
          error.response?.data?.message || 'Failed to process subscription. Please try again.',
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchSubscriptions() {
    loading.value = true
    try {
      const response = await api.get('/getSub')
      if (response.data.status === 1) {
        subscriptions.value = response.data.data.subcriptions
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch subscriptions',
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchCardDetails() {
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      const formData = new FormData()
      formData.append('user_id', authStore.user.id)

      const response = await api.post('/payment/get-card', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        cardDetails.value = response.data.data
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Error fetching card details:', error)
      return { success: false, message: error.message || 'Failed to fetch card details' }
    }
  }

  return {
    paymentMethods,
    currentSubscription,
    subscriptions,
    loading,
    cardDetails,
    addPaymentMethod,
    subscribeToPlan,
    fetchSubscriptions,
    fetchCardDetails,
  }
})
