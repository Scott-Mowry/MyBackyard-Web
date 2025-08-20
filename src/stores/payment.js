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

  // Unsubscribe state
  const unsubStatus = ref(0) // 0 = active, 1 = pending unsubscribe
  const unsubLoading = ref(false)
  const unsubMessage = ref('')

  // Recurring subscription state
  const recurringStatus = ref(null)
  const recurringLoading = ref(false)

  /**
   * Add a new payment method (credit card)
   * @param {Object} payload – The payment details payload
   * @param {string} payload.user_id – (Optional) User ID (if not provided, authStore.user.id is used)
   * @param {string} payload.card_number – Card number
   * @param {string} payload.expiration_date – Expiration date (MM/YY)
   * @param {string} payload.ccv – Card security code
   * (Optional fields: firstname, lastname, company, address, city, state, zipcode, country)
   */
  async function addPaymentMethod(payload) {
    loading.value = true
    try {
      if (!authStore.user?.id) {
        console.error('User not authenticated - no user ID found')
        throw new Error('User not authenticated')
      }

      // Validate required fields
      const requiredFields = [
        'card_number',
        'firstname',
        'lastname',
        'address',
        'city',
        'state',
        'zipcode',
        'country',
        'expiration_date',
        'ccv',
      ]

      const missingFields = requiredFields.filter((field) => !payload[field])
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields)
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      const user = authStore.user

      // Helper function to clean string values
      const cleanString = (str) => {
        if (!str) return ''
        // Remove extra spaces and limit to 255 characters
        return String(str).trim().replace(/\s+/g, ' ').slice(0, 255)
      }

      // Format expiration date (keep MM/YY format)
      const formatExpirationDate = (date) => {
        if (!date) {
          console.error('Empty expiration date provided')
          return ''
        }
        try {
          const [month, year] = date.split('/')

          if (!month || !year) {
            console.error('Invalid expiration date format - missing month or year:', {
              month,
              year,
            })
            throw new Error('Invalid expiration date format')
          }

          const monthNum = parseInt(month, 10)
          const yearNum = parseInt(year, 10)

          if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            console.error('Invalid month value:', monthNum)
            throw new Error('Invalid month')
          }
          if (isNaN(yearNum) || yearNum < 0 || yearNum > 99) {
            console.error('Invalid year value:', yearNum)
            throw new Error('Invalid year')
          }

          // Keep MM/YY format (e.g., 05/29)
          const formattedDate = `${monthNum.toString().padStart(2, '0')}/${yearNum.toString().padStart(2, '0')}`
          return formattedDate
        } catch (error) {
          console.error('Error formatting expiration date:', {
            error: error.message,
            input: date,
            stack: error.stack,
          })
          throw new Error('Invalid expiration date format')
        }
      }

      // Format card number (remove spaces and validate)
      const formatCardNumber = (number) => {
        if (!number) {
          console.error('Empty card number provided')
          return ''
        }
        // Remove all spaces and validate
        const cleaned = number.replace(/\s/g, '')
        if (!/^\d{15,16}$/.test(cleaned)) {
          console.error('Invalid card number format - length:', cleaned.length)
          throw new Error('Card number must be 15 or 16 digits')
        }
        return cleaned
      }

      // Format CCV (validate 3 digits)
      const formatCCV = (ccv) => {
        if (!ccv) {
          console.error('Empty CCV provided')
          return ''
        }
        // Remove all spaces and validate
        const cleaned = ccv.replace(/\s/g, '')
        if (!/^\d{3}$/.test(cleaned)) {
          console.error('Invalid CCV format - length:', cleaned.length)
          throw new Error('Invalid CCV format')
        }
        return cleaned
      }

      // Format zipcode (remove spaces and validate)
      const formatZipcode = (zip) => {
        if (!zip) {
          console.error('Empty zipcode provided')
          return ''
        }
        const cleaned = zip.replace(/\s/g, '')
        if (!/^\d{5}$/.test(cleaned)) {
          console.error('Invalid zipcode format - length:', cleaned.length)
          throw new Error('Invalid zipcode format')
        }
        return cleaned
      }

      try {
        const formattedData = {
          user_id: String(user.id),
          card_number: formatCardNumber(payload.card_number),
          expiration_date: formatExpirationDate(payload.expiration_date),
          ccv: formatCCV(payload.ccv),
          firstName: cleanString(payload.firstname),
          lastName: cleanString(payload.lastname),
          address: cleanString(payload.address),
          city: cleanString(payload.city),
          state: cleanString(payload.state),
          zip: formatZipcode(payload.zipcode),
          country: cleanString(payload.country),
        }

        if (payload.company) {
          formattedData.company = cleanString(payload.company)
        }

        const formData = new FormData()
        const formDataFields = [
          'user_id',
          'card_number',
          'expiration_date',
          'ccv',
          'firstName',
          'lastName',
          'company',
          'address',
          'city',
          'state',
          'zip',
          'country',
        ]

        formDataFields.forEach((field) => {
          if (
            formattedData[field] !== undefined &&
            formattedData[field] !== null &&
            formattedData[field] !== ''
          ) {
            formData.append(field, String(formattedData[field]))
          }
        })

        try {
          const response = await api.post('/payment/add-card', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
            validateStatus: function (status) {
              return status >= 200 && status < 500
            },
          })

          if (response.status === 200) {
            // Update user details to get the new payment profile ID
            await authStore.fetchUserDetails()
            $q.notify({ type: 'positive', message: 'Payment method added successfully' })
            return { success: true, data: response.data.data }
          } else if (response.status === 422) {
            // Handle validation errors
            console.error('Validation errors:', response.data)
            const errorMessage = response.data.message || 'Validation failed'
            const validationErrors = response.data.errors
            if (validationErrors) {
              const errorDetails = Object.entries(validationErrors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n')
              throw new Error(`${errorMessage}\n${errorDetails}`)
            }
            throw new Error(errorMessage)
          } else if (response.status === 500) {
            // Handle server errors with more detail
            console.error('Server error details:', {
              status: response.status,
              data: response.data,
            })
            throw new Error(response.data.message || 'Server error occurred. Please try again.')
          } else {
            console.error('Unexpected response:', response)
            throw new Error(response.data.message || 'Failed to add payment method')
          }
        } catch (requestError) {
          console.error('Request error:', {
            error: requestError.message,
            response: requestError.response?.data,
            status: requestError.response?.status,
            stack: requestError.stack,
          })
          throw requestError
        }
      } catch (formatError) {
        console.error('Data formatting error:', {
          error: formatError.message,
          stack: formatError.stack,
        })
        throw new Error(formatError.message || 'Invalid payment data format')
      }
    } catch (error) {
      console.error('Error adding payment method:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        requestData: error.config?.data,
        validationErrors: error.response?.data?.errors,
        stack: error.stack,
      })

      // Show appropriate error message
      let errorMessage = 'Failed to add payment method'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      $q.notify({
        type: 'negative',
        message: errorMessage,
        timeout: 5000,
        position: 'top',
      })

      return {
        success: false,
        message: errorMessage,
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

      if (!authStore.user.payment_profile_id) {
        throw new Error('No payment profile found. Please add a payment method first.')
      }

      const response = await api.post('/payment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data && response.data.success === true) {
        // Update user data to reflect new subscription
        await authStore.fetchUserDetails()
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

  /**
   * Fetch subscriptions using V2 API with enhanced fields
   */
  async function fetchSubscriptionsV2() {
    loading.value = true
    try {
      const response = await api.get('/v2/getSub')
      if (response.data.success) {
        subscriptions.value = response.data.data.subscriptions
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Error fetching V2 subscriptions:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch subscriptions',
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Create recurring subscription (for business users)
   */
  async function createRecurringSubscription(planId, options = {}) {
    recurringLoading.value = true
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      if (!authStore.user.payment_profile_id) {
        throw new Error('No payment profile found. Please add a payment method first.')
      }

      const payload = {
        user_id: authStore.user.id,
        subscription_id: planId,
        ...options, // start_date, total_occurrences
      }

      const response = await api.post('/v2/recurring/create', payload)

      if (response.data.success) {
        // Update user data to reflect new subscription
        await authStore.fetchUserDetails()
        return { success: true, data: response.data.data }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to create recurring subscription',
        }
      }
    } catch (error) {
      console.error('Recurring subscription error:', error)
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Failed to create recurring subscription. Please try again.',
      }
    } finally {
      recurringLoading.value = false
    }
  }

  /**
   * Cancel recurring subscription
   */
  async function cancelRecurringSubscription() {
    recurringLoading.value = true
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      const payload = {
        user_id: authStore.user.id,
      }

      console.log('Cancelling recurring subscription with payload:', payload)
      const response = await api.post('/v2/recurring/cancel', payload)

      if (response.data.success) {
        await authStore.fetchUserDetails()
        return { success: true, data: response.data.data }
      } else {
        console.error('Cancel recurring failed:', response.data)
        return {
          success: false,
          message: response.data.message || 'Failed to cancel recurring subscription',
        }
      }
    } catch (error) {
      console.error('Cancel recurring subscription error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        user: {
          id: authStore.user?.id,
          recurring_subscription_id: authStore.user?.recurring_subscription_id,
          recurring_subscription_status: authStore.user?.recurring_subscription_status,
        },
      })
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Failed to cancel recurring subscription. Please try again.',
      }
    } finally {
      recurringLoading.value = false
    }
  }

  /**
   * Get recurring subscription status
   */
  async function getRecurringSubscriptionStatus() {
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      const response = await api.get(`/v2/recurring/status?user_id=${authStore.user.id}`)
      // console.log('Recurring subscription status:', response.data)
      if (response.data.success) {
        recurringStatus.value = response.data.data
        return { success: true, data: response.data.data }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get subscription status',
        }
      }
    } catch (error) {
      console.error('Get recurring subscription status error:', error)
      return {
        success: false,
        message:
          error.response?.data?.message || 'Failed to get subscription status. Please try again.',
      }
    }
  }

  /**
   * Update recurring subscription plan
   */
  async function updateRecurringSubscription(newPlanId) {
    recurringLoading.value = true
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      const payload = {
        user_id: authStore.user.id,
        new_subscription_id: newPlanId,
      }

      const response = await api.post('/v2/recurring/update', payload)

      if (response.data.success) {
        await authStore.fetchUserDetails()
        return { success: true, data: response.data.data }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update recurring subscription',
        }
      }
    } catch (error) {
      console.error('Update recurring subscription error:', error)
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Failed to update recurring subscription. Please try again.',
      }
    } finally {
      recurringLoading.value = false
    }
  }

  // Update fetchSubscriptions to use V2 by default
  async function fetchSubscriptions() {
    return await fetchSubscriptionsV2()
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

  /**
   * Check unsubscribe status
   */
  async function checkUnsub() {
    unsubLoading.value = true
    try {
      // Check if user has required data
      if (!authStore.user?.id) {
        console.error('No user ID available')
        return { success: false, message: 'User not authenticated' }
      }

      if (!authStore.user?.sub_id) {
        console.error('No subscription ID available')
        return { success: false, message: 'No active subscription found' }
      }

      // Go directly to the working approach with required parameters
      const formData = new FormData()
      formData.append('user_id', String(authStore.user?.id))
      formData.append('subscription_id', String(authStore.user?.sub_id))

      const response = await api.post('/unsub/check', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        unsubStatus.value = response.data.data.unsub
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Error checking unsubscribe status:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check unsubscribe status',
      }
    } finally {
      unsubLoading.value = false
    }
  }

  /**
   * Initiate unsubscribe process
   */
  async function unsubscribe() {
    unsubLoading.value = true
    try {
      const formData = new FormData()
      formData.append('user_id', String(authStore.user?.id))
      formData.append('subscription_id', String(authStore.user?.sub_id))

      const response = await api.post('/unsub', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (response.data.success) {
        unsubMessage.value = response.data.message
        await checkUnsub() // Refresh status
        return { success: true, message: response.data.message }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      return { success: false, message: error.response?.data?.message || 'Failed to unsubscribe' }
    } finally {
      unsubLoading.value = false
    }
  }

  /**
   * Cancel unsubscribe process
   */
  async function cancelUnsub() {
    unsubLoading.value = true
    try {
      const formData = new FormData()
      formData.append('user_id', String(authStore.user?.id))
      formData.append('subscription_id', String(authStore.user?.sub_id))

      const response = await api.post('/unsub/cancel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (response.data.success) {
        unsubMessage.value = response.data.message
        await checkUnsub() // Refresh status
        return { success: true, message: response.data.message }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Error canceling unsubscribe:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel unsubscribe',
      }
    } finally {
      unsubLoading.value = false
    }
  }

  return {
    paymentMethods,
    currentSubscription,
    subscriptions,
    loading,
    cardDetails,
    unsubStatus,
    unsubLoading,
    unsubMessage,
    addPaymentMethod,
    subscribeToPlan,
    fetchSubscriptions,
    fetchCardDetails,
    checkUnsub,
    unsubscribe,
    cancelUnsub,
    recurringStatus,
    recurringLoading,
    createRecurringSubscription,
    cancelRecurringSubscription,
    getRecurringSubscriptionStatus,
    updateRecurringSubscription,
  }
})
