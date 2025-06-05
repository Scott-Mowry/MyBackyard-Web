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
   * @param {Object} payload – The payment details payload
   * @param {string} payload.user_id – (Optional) User ID (if not provided, authStore.user.id is used)
   * @param {string} payload.card_number – Card number
   * @param {string} payload.expiration_date – Expiration date (MM/YY)
   * @param {string} payload.ccv – Card security code
   * (Optional fields: firstname, lastname, company, address, city, state, zipcode, country)
   */
  async function addPaymentMethod(payload) {
    loading.value = true
    console.log('Starting addPaymentMethod with payload:', payload)
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

      // Create form data
      const user = authStore.user
      console.log('Processing payment for user:', {
        id: user.id,
        name: user.name,
        email: user.email,
      })

      // Helper function to clean string values
      const cleanString = (str) => {
        if (!str) return ''
        return String(str).trim().replace(/\s+/g, ' ')
      }

      // Format expiration date (keep MM/YY format)
      const formatExpirationDate = (date) => {
        console.log('Formatting expiration date:', date)
        if (!date) {
          console.error('Empty expiration date provided')
          return ''
        }
        try {
          const [month, year] = date.split('/')
          console.log('Split expiration date - month:', month, 'year:', year)

          if (!month || !year) {
            console.error('Invalid expiration date format - missing month or year:', {
              month,
              year,
            })
            throw new Error('Invalid expiration date format')
          }

          const monthNum = parseInt(month, 10)
          const yearNum = parseInt(year, 10)
          console.log('Parsed expiration date - monthNum:', monthNum, 'yearNum:', yearNum)

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
          console.log('Formatted expiration date:', formattedDate)
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
        console.log('Formatting card number:', number)
        if (!number) {
          console.error('Empty card number provided')
          return ''
        }
        const cleaned = number.replace(/\s/g, '')
        if (!/^\d{16}$/.test(cleaned)) {
          console.error('Invalid card number format - length:', cleaned.length)
          throw new Error('Invalid card number format')
        }
        console.log('Card number validation passed')
        return cleaned
      }

      // Format CCV (validate 3 digits)
      const formatCCV = (ccv) => {
        console.log('Formatting CCV:', ccv)
        if (!ccv) {
          console.error('Empty CCV provided')
          return ''
        }
        const cleaned = ccv.trim()
        if (!/^\d{3}$/.test(cleaned)) {
          console.error('Invalid CCV format - length:', cleaned.length)
          throw new Error('Invalid CCV format')
        }
        console.log('CCV validation passed')
        return cleaned
      }

      try {
        // Format and validate all fields first
        console.log('Starting to format and validate all fields')
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
          zip: cleanString(payload.zipcode),
          country: cleanString(payload.country),
        }

        // Add company if it exists
        if (payload.company) {
          formattedData.company = cleanString(payload.company)
        }

        console.log('Formatted data:', formattedData)

        // Create a new FormData object
        const formData = new FormData()

        // Add fields in the exact order as Postman
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

        // Add each field to FormData in exact order
        formDataFields.forEach((field) => {
          if (
            formattedData[field] !== undefined &&
            formattedData[field] !== null &&
            formattedData[field] !== ''
          ) {
            formData.append(field, String(formattedData[field]))
          }
        })

        // Log the actual form data being sent
        const formDataObj = {}
        formData.forEach((value, key) => {
          formDataObj[key] = value
        })
        console.log('Sending form data to API:', formDataObj)

        // Make the API request with better error handling
        try {
          console.log('Making API request to /payment/add-card')
          const response = await api.post('/payment/add-card', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
            validateStatus: function (status) {
              return status >= 200 && status < 500
            },
          })

          // Log the complete response
          console.log('API Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers,
            requestData: formDataObj,
          })

          if (response.status === 200) {
            console.log('Payment method added successfully')
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
              requestData: formDataObj,
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
            requestData: formDataObj,
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

      // Check for success in the response data
      if (response.data && response.data.success === true) {
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
