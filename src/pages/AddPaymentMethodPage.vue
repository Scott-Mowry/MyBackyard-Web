<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 600px">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h5 q-mb-md">Add Payment Method</div>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <!-- Card Number -->
            <q-input
              v-model="cardDetails.card_number"
              label="Card Number"
              mask="#### #### #### ####"
              unmasked-value
              :rules="[
                (val) => !!val || 'Card number is required',
                (val) => {
                  const cleaned = val.replace(/\s/g, '')
                  return (
                    cleaned.length === 15 ||
                    cleaned.length === 16 ||
                    'Card number must be 15 or 16 digits'
                  )
                },
              ]"
            />

            <!-- First Name -->
            <q-input
              v-model="cardDetails.firstname"
              label="First Name"
              maxlength="255"
              :rules="[
                (val) => !!val || 'First name is required',
                (val) => val.length <= 255 || 'First name must be less than 255 characters',
              ]"
            />

            <!-- Last Name -->
            <q-input
              v-model="cardDetails.lastname"
              label="Last Name"
              maxlength="255"
              :rules="[
                (val) => !!val || 'Last name is required',
                (val) => val.length <= 255 || 'Last name must be less than 255 characters',
              ]"
            />

            <!-- Company (Optional) -->
            <q-input
              v-model="cardDetails.company"
              label="Company (Optional)"
              maxlength="255"
              :rules="[
                (val) =>
                  !val || val.length <= 255 || 'Company name must be less than 255 characters',
              ]"
            />

            <!-- Address -->
            <q-input
              v-model="cardDetails.address"
              label="Address"
              maxlength="255"
              :rules="[
                (val) => !!val || 'Address is required',
                (val) => val.length <= 255 || 'Address must be less than 255 characters',
              ]"
            />

            <!-- City -->
            <q-input
              v-model="formattedCity"
              label="City"
              maxlength="255"
              :rules="[
                (val) => !!val || 'City is required',
                (val) => val.length <= 255 || 'City must be less than 255 characters',
              ]"
            />

            <!-- State Dropdown -->
            <q-select
              v-model="cardDetails.state"
              :options="usStates"
              label="State"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'State is required']"
            />

            <!-- Zipcode -->
            <q-input
              v-model="cardDetails.zipcode"
              label="Zipcode"
              mask="#####"
              unmasked-value
              :rules="[(val) => !!val || 'Zipcode is required']"
            />

            <!-- Country (hidden, always US) -->
            <q-input
              v-model="cardDetails.country"
              label="Country"
              readonly
              disable
              class="hidden"
            />

            <!-- Expiry Date -->
            <q-input
              v-model="cardDetails.expiration_date"
              label="Expiration Date"
              mask="##/##"
              fill-mask
              unmasked-value
              placeholder="MM/YY"
              :rules="[
                (val) => !!val || 'Expiration date is required',
                (val) => {
                  if (!val) return true
                  // Only validate if we have a complete date
                  if (!/^\d{2}\/\d{2}$/.test(val)) {
                    return true // Don't show error while typing
                  }
                  const [month, year] = val.split('/')
                  const monthNum = parseInt(month, 10)
                  const yearNum = parseInt(year, 10)

                  // Only validate month if we have a complete date
                  if (monthNum < 1 || monthNum > 12) {
                    return 'Month must be between 01 and 12'
                  }

                  // Only validate year if we have a complete date
                  if (yearNum < 0 || yearNum > 99) {
                    return 'Invalid year'
                  }

                  // Only check expiration if we have a complete date
                  const currentDate = new Date()
                  const currentYear = currentDate.getFullYear() % 100
                  const currentMonth = currentDate.getMonth() + 1

                  if (
                    yearNum < currentYear ||
                    (yearNum === currentYear && monthNum < currentMonth)
                  ) {
                    return 'Card has expired'
                  }

                  return true
                },
              ]"
              lazy-rules
              @update:model-value="handleExpirationDateUpdate"
            />

            <!-- CCV -->
            <q-input
              v-model="cardDetails.ccv"
              label="CCV"
              mask="###"
              unmasked-value
              :rules="[
                (val) => !!val || 'CCV is required',
                (val) => val.replace(/\s/g, '').length === 3 || 'CCV must be 3 digits',
              ]"
            />

            <!-- Submit Button -->
            <div class="row justify-end q-mt-md">
              <q-btn
                label="Add Payment Method"
                type="submit"
                color="primary"
                :loading="paymentStore.loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePaymentStore } from 'stores/payment'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

// Add US states array
const usStates = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
  { label: 'District of Columbia', value: 'DC' },
]

const router = useRouter()
const route = useRoute()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()
const $q = useQuasar()

const cardDetails = ref({
  card_number: '',
  firstname: '',
  lastname: '',
  company: '',
  address: '',
  city: '',
  state: '',
  zipcode: '',
  country: 'US', // Set default country to US
  expiration_date: '',
  ccv: '',
})

// Add computed property for city with capitalization
const formattedCity = computed({
  get: () => cardDetails.value.city,
  set: (val) => {
    // Capitalize first letter and make rest lowercase
    cardDetails.value.city = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
  },
})

// Populate user data when component mounts
onMounted(() => {
  const user = authStore.user
  if (user) {
    // Populate user data if available
    cardDetails.value.firstname = user.name || ''
    cardDetails.value.lastname = user.last_name || ''
    cardDetails.value.address = user.address || ''
  }

  // Check if we have a plan ID in the query
  const planId = route.query.plan
  if (!planId) {
    // If no plan ID, redirect to subscription plans
    router.push('/subscription-plans')
  }
})

function handleExpirationDateUpdate(val) {
  if (!val) {
    cardDetails.value.expiration_date = ''
    return
  }

  try {
    // Remove any non-digit characters except slash
    let cleaned = val.replace(/[^\d/]/g, '')

    // If we have a slash, split into month and year
    if (cleaned.includes('/')) {
      let [month, year] = cleaned.split('/')

      // Handle month - only format if we have a complete date
      if (month && year && year.length === 2) {
        const monthNum = parseInt(month, 10)
        if (monthNum > 12) {
          month = '12'
        } else {
          // Keep the original input, just ensure 2 digits
          month = monthNum.toString().padStart(2, '0')
        }
        // Format year to 2 digits
        year = year.slice(0, 2).padStart(2, '0')
        cardDetails.value.expiration_date = `${month}/${year}`
      } else if (month) {
        // If we only have month, just add the slash
        cardDetails.value.expiration_date = `${month}/`
      }
    } else {
      // No slash yet, just let the user type the month
      if (cleaned.length > 0) {
        // Only format if we have 2 digits
        if (cleaned.length === 2) {
          const monthNum = parseInt(cleaned, 10)
          if (monthNum > 12) {
            cleaned = '12'
          }
          cardDetails.value.expiration_date = `${cleaned}/`
        } else {
          // Otherwise just let the user type
          cardDetails.value.expiration_date = cleaned
        }
      }
    }
  } catch (error) {
    console.error('Error handling expiration date update:', error)
    // If there's an error, just set the raw value
    cardDetails.value.expiration_date = val
  }
}

async function onSubmit() {
  try {
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

    const missingFields = requiredFields.filter((field) => !cardDetails.value[field])
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      $q.notify({
        type: 'negative',
        message: `Please fill in all required fields: ${missingFields.join(', ')}`,
      })
      return
    }

    // Validate card number length
    const cleanedCardNumber = cardDetails.value.card_number.replace(/\s/g, '')
    if (cleanedCardNumber.length !== 15 && cleanedCardNumber.length !== 16) {
      console.error('Invalid card number length:', cleanedCardNumber.length)
      $q.notify({
        type: 'negative',
        message: 'Card number must be 15 or 16 digits',
      })
      return
    }

    // Validate CCV length
    if (cardDetails.value.ccv.length !== 3) {
      console.error('Invalid CCV length:', cardDetails.value.ccv.length)
      $q.notify({
        type: 'negative',
        message: 'CCV must be 3 digits',
      })
      return
    }

    // Validate expiration date
    let expirationDate = cardDetails.value.expiration_date

    // Ensure the date has the proper format with slash
    if (expirationDate && !expirationDate.includes('/')) {
      // If we have a 4-digit number, split it into month/year
      if (/^\d{4}$/.test(expirationDate)) {
        const month = expirationDate.slice(0, 2)
        const year = expirationDate.slice(2)
        expirationDate = `${month}/${year}`
      }
    }

    if (!expirationDate || !/^\d{2}\/\d{2}$/.test(expirationDate)) {
      console.error('Invalid expiration date format:', expirationDate)
      $q.notify({
        type: 'negative',
        message: 'Please enter a complete expiration date (MM/YY)',
      })
      return
    }

    const [month, year] = expirationDate.split('/')
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)

    // Final validation of month and year
    if (monthNum < 1 || monthNum > 12) {
      console.error('Invalid month:', monthNum)
      $q.notify({
        type: 'negative',
        message: 'Month must be between 01 and 12',
      })
      return
    }

    if (yearNum < 0 || yearNum > 99) {
      console.error('Invalid year:', yearNum)
      $q.notify({
        type: 'negative',
        message: 'Invalid year',
      })
      return
    }

    // Check if card is expired
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      console.error('Card expired:', { month: monthNum, year: yearNum, currentMonth, currentYear })
      $q.notify({
        type: 'negative',
        message: 'Card has expired',
      })
      return
    }

    // Create a clean copy of the data with properly formatted expiration date and removed spaces
    const paymentData = {
      card_number: cardDetails.value.card_number.replace(/\s/g, ''),
      firstname: cardDetails.value.firstname.trim(),
      lastname: cardDetails.value.lastname.trim(),
      address: cardDetails.value.address.trim(),
      city: cardDetails.value.city.trim().replace(/\s+/g, ' '),
      state: cardDetails.value.state.trim(),
      zipcode: cardDetails.value.zipcode.replace(/\s/g, ''),
      country: cardDetails.value.country.trim(),
      expiration_date: `${monthNum.toString().padStart(2, '0')}/${yearNum.toString().padStart(2, '0')}`,
      ccv: cardDetails.value.ccv.replace(/\s/g, ''),
    }

    // Add company only if it's not empty
    if (cardDetails.value.company?.trim()) {
      paymentData.company = cardDetails.value.company.trim()
    }

    const result = await paymentStore.addPaymentMethod(paymentData)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Payment method added successfully',
      })

      // Check if we have a plan ID in the query
      const planId = route.query.plan
      if (planId) {
        // If we have a plan ID, redirect to payment page
        router.push({
          name: 'payment',
          query: { plan: planId },
        })
      } else {
        console.log('Redirecting to profile page')
        // Otherwise redirect to profile
        router.push('/profile')
      }
    } else {
      console.error('Failed to add payment method:', result.message)
      $q.notify({
        type: 'negative',
        message: result.message || 'Failed to add payment method',
      })
    }
  } catch (error) {
    console.error('Error in form submission:', {
      error,
      message: error.message,
      response: error.response?.data,
      cardDetails: {
        ...cardDetails.value,
        card_number: cardDetails.value.card_number?.replace(/^(\d{6})\d+(\d{4})$/, '$1******$2'),
        ccv: '***',
      },
    })
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to add payment method. Please try again.',
    })
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding-top: 2rem;
}

.hidden {
  display: none;
}
</style>
