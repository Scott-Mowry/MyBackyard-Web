<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 800px">
      <q-card class="q-pa-lg">
        <q-card-section>
          <div class="text-h5 q-mb-lg">
            {{ getPageTitle() }}
          </div>

          <!-- Plan Change Notice -->
          <div v-if="isUpgradeOrChange && authStore.user?.sub_id" class="q-mb-lg">
            <q-banner color="info" class="q-mb-md" icon="info">
              <div class="text-weight-medium">
                {{ getActionDescription() }}
              </div>
              <div class="text-caption q-mt-xs">
                {{ getActionDetails() }}
              </div>
            </q-banner>
          </div>

          <!-- Selected Plan Details -->
          <div v-if="selectedPlan" class="q-mb-xl">
            <div class="text-h6 q-mb-sm">Selected Plan</div>
            <q-card flat bordered class="q-pa-md">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-h6">{{ selectedPlan.name }}</div>
                  <div class="text-subtitle1 text-grey-8">{{ selectedPlan.role }}</div>
                  <div v-if="selectedPlan.description" class="text-body2 text-grey-7 q-mt-xs">
                    {{ selectedPlan.description }}
                  </div>
                </div>
                <div class="text-h5 text-primary">
                  {{ selectedPlan.formatted_price || `$${selectedPlan.price}` }}
                  <span class="text-subtitle2"
                    >/{{ selectedPlan.billing_cycle || selectedPlan.type.toLowerCase() }}</span
                  >
                </div>
              </div>
            </q-card>
          </div>

          <!-- Subscription Type Selection (for Business users) -->
          <div v-if="selectedPlan && authStore.user?.role === 'Business'" class="q-mb-xl">
            <div class="text-h6 q-mb-sm">Subscription Type</div>
            <q-card flat bordered class="q-pa-md">
              <!-- <q-radio
                v-model="subscriptionType"
                val="one_time"
                label="One-time Payment"
                class="q-mb-md"
              />
              <div class="text-caption text-grey-7 q-mb-lg q-ml-lg">
                Pay once for this subscription period
              </div> -->

              <q-radio
                v-model="subscriptionType"
                val="recurring"
                label="Recurring Subscription (Recommended)"
                class="q-mb-md"
              />
              <div class="text-caption text-grey-7 q-mb-md q-ml-lg">
                Automatic renewal - never miss a payment, cancel anytime
              </div>

              <!-- Billing Cycle Limitation Warning -->
              <div
                v-if="selectedPlan.billing_cycle === 'Daily' && subscriptionType === 'recurring'"
                class="q-mt-md"
              >
                <q-banner color="warning" class="q-mb-md" icon="warning">
                  <div class="text-weight-medium">Billing Cycle Limitation</div>
                  <div class="text-caption q-mt-xs">
                    Due to payment processor limitations, daily billing cycles are processed weekly
                    (every 7 days) for recurring subscriptions.
                  </div>
                </q-banner>
              </div>

              <!-- Recurring options -->
              <div v-if="subscriptionType === 'recurring'" class="q-ml-lg q-pl-md border-left">
                <!-- <div class="text-subtitle2 q-mb-sm">Start Date (Optional)</div>
                <q-input
                  v-model="recurringOptions.start_date"
                  type="date"
                  outlined
                  dense
                  class="q-mb-md"
                  :min="new Date().toISOString().split('T')[0]"
                />

                <div class="text-caption text-grey-7">
                  If not specified, subscription starts immediately
                </div> -->
              </div>
            </q-card>
          </div>

          <!-- Payment Method -->
          <div class="q-mb-xl">
            <div class="text-h6 q-mb-sm">Payment Method</div>
            <q-card flat bordered class="q-pa-md">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-subtitle1">{{ maskedCardNumber }}</div>
                  <div v-if="!cardDetails?.last4" class="text-caption text-negative">
                    No payment method on file. Please add a card to continue.
                  </div>
                </div>
                <q-btn
                  flat
                  color="primary"
                  label="Change Card"
                  :to="{ name: 'add-payment-method', query: { plan: route.query.plan } }"
                />
              </div>
            </q-card>
          </div>

          <!-- Terms and Conditions -->
          <div class="q-mb-xl">
            <q-checkbox
              v-model="termsAccepted"
              label="I agree to the terms and conditions"
              :rules="[(val) => !!val || 'You must accept the terms to continue']"
            />
          </div>

          <!-- Promo Code Section -->
          <!-- <div class="q-mb-xl">
            <div class="text-h6 q-mb-sm">Promo Code (Optional)</div>
            <q-card flat bordered class="q-pa-md">
              <div class="row q-gutter-md items-end">
                <div class="col">
                  <q-input
                    v-model="promoCode"
                    label="Enter Promo Code"
                    outlined
                    dense
                    :disable="promoLoading || promoApplied"
                    placeholder="SAVE10, WELCOME2024, etc."
                  />
                </div>
                <div>
                  <q-btn
                    v-if="!promoApplied"
                    color="secondary"
                    label="Apply"
                    @click="applyPromoCode"
                    :loading="promoLoading"
                    :disable="!promoCode || promoLoading"
                    unelevated
                  />
                  <q-btn v-else color="positive" label="Applied" icon="check" disable unelevated />
                </div>
              </div>

              <div v-if="promoMessage" class="q-mt-md">
                <div
                  :class="{ 'text-positive': promoSuccess, 'text-negative': !promoSuccess }"
                  class="row items-center"
                >
                  <q-icon
                    :name="promoSuccess ? 'check_circle' : 'error'"
                    size="18px"
                    class="q-mr-sm"
                  />
                  <span>{{ promoMessage }}</span>
                </div>
              </div>

              <div v-if="promoApplied && appliedPromoDetails" class="q-mt-md">
                <q-separator class="q-mb-md" />
                <div class="text-subtitle2 text-weight-medium q-mb-xs">Promo Code Applied</div>
                <div class="text-body2 text-grey-7">
                  {{
                    appliedPromoDetails.description ||
                    'Promotional discount applied to your subscription'
                  }}
                </div>
              </div>
            </q-card>
          </div> -->

          <!-- Submit Button -->
          <div class="row justify-end">
            <q-btn
              v-if="!promoApplied"
              color="primary"
              :label="getSubmitButtonText()"
              :loading="loading"
              :disable="!termsAccepted"
              @click="handlePayment"
              unelevated
            />
            <q-btn
              v-else
              color="positive"
              label="View My Subscription"
              icon="arrow_forward"
              @click="router.push('/current-subscription')"
              unelevated
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePaymentStore } from 'stores/payment'
import { useAuthStore } from 'stores/auth'
// import { api } from 'boot/axios'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()

const loading = ref(false)
const termsAccepted = ref(false)
const selectedPlan = ref(null)
const cardDetails = ref(null)
const subscriptionType = ref('recurring') // Default to recurring
const recurringOptions = ref({
  start_date: '',
})

// Promo code state
// const promoCode = ref('')
// const promoLoading = ref(false)
// const promoMessage = ref('')
// const promoSuccess = ref(false)
const promoApplied = ref(false)
// const appliedPromoDetails = ref(null)

// Get the selected plan and card details
onMounted(async () => {
  const planId = route.query.plan
  if (!planId) {
    router.push('/subscription-plans')
    return
  }

  // Check if this is a plan change/upgrade (allow existing subscribers)
  const isUpgrade = route.query.upgrade === 'true'
  const isChange = route.query.change === 'true'
  const isReplace = route.query.replace === 'true'

  // Only block if user has ACTIVE subscription AND it's not an upgrade/change/replace
  // For business users, we need to check if their recurring subscription is actually active
  let hasActiveSubscription = false

  if (authStore.user?.role === 'Business' && authStore.user?.recurring_subscription_id) {
    // For business users, check if recurring subscription is active
    try {
      const statusResult = await paymentStore.getRecurringSubscriptionStatus()
      hasActiveSubscription =
        statusResult.success &&
        statusResult.data.status !== 'none' &&
        statusResult.data.local_status === 'active'
    } catch (error) {
      console.log('Could not check recurring status:', error)
      hasActiveSubscription = false
    }
  } else if (authStore.user?.sub_id) {
    // For regular users, check if they have a subscription
    hasActiveSubscription = true
  }

  if (hasActiveSubscription && !isUpgrade && !isChange && !isReplace) {
    $q.notify({
      type: 'info',
      message: 'You already have an active subscription!',
      position: 'top',
      timeout: 3000,
    })
    router.push('/current-subscription')
    return
  }

  // Fetch subscriptions if not already loaded
  if (!paymentStore.subscriptions.length) {
    await paymentStore.fetchSubscriptions()
  }

  selectedPlan.value = paymentStore.subscriptions.find((p) => p.id === parseInt(planId))
  if (!selectedPlan.value) {
    router.push('/subscription-plans')
    return
  }

  // Fetch card details
  const result = await paymentStore.fetchCardDetails()
  if (result.success) {
    cardDetails.value = result.data
  } else {
    $q.notify({
      type: 'negative',
      message: 'Failed to load card details. Please try again.',
      position: 'top',
      timeout: 3000,
    })
  }
})

// Use actual card details from API
const maskedCardNumber = computed(() => {
  if (!cardDetails.value?.last4) return 'No card on file'
  return `**** **** **** ${cardDetails.value.last4}`
})

// Check if this is an upgrade or plan change
const isUpgradeOrChange = computed(() => {
  return (
    route.query.upgrade === 'true' ||
    route.query.change === 'true' ||
    route.query.replace === 'true'
  )
})

function getPageTitle() {
  if (route.query.upgrade === 'true') {
    return 'Confirm Upgrade'
  } else if (route.query.change === 'true') {
    return 'Change Your Subscription'
  } else if (route.query.replace === 'true') {
    return 'Replace Your Subscription'
  }
  return 'Complete Your Subscription'
}

function getActionDescription() {
  if (route.query.upgrade === 'true') {
    return 'Upgrading'
  } else if (route.query.change === 'true') {
    return 'Changing'
  } else if (route.query.replace === 'true') {
    return 'Replacing'
  }
  return 'Completing'
}

function getActionDetails() {
  if (route.query.upgrade === 'true') {
    return 'Your current subscription plan will be upgraded to the new plan.'
  } else if (route.query.change === 'true') {
    return 'Your current subscription plan will be changed to the new plan.'
  } else if (route.query.replace === 'true') {
    return 'Your current subscription will be replaced with the new plan.'
  }
  return 'Your subscription will be completed.'
}

function getSubmitButtonText() {
  if (route.query.upgrade === 'true') {
    return 'Confirm Upgrade'
  } else if (route.query.change === 'true') {
    return 'Change Plan'
  } else if (route.query.replace === 'true') {
    return 'Replace Plan'
  }
  return 'Complete Subscription'
}

async function handlePayment() {
  if (!termsAccepted.value) return

  // If promo code is already applied, user already has subscription
  if (promoApplied.value) {
    $q.notify({
      type: 'info',
      message: 'Your subscription is already active through the promo code!',
      position: 'top',
      timeout: 3000,
    })
    router.push('/current-subscription')
    return
  }

  loading.value = true
  try {
    let result

    // Check if it's a business user and they selected recurring
    if (authStore.user?.role === 'Business' && subscriptionType.value === 'recurring') {
      // Use recurring subscription
      const options = {}
      if (recurringOptions.value.start_date) {
        options.start_date = recurringOptions.value.start_date
      }

      result = await paymentStore.createRecurringSubscription(selectedPlan.value.id, options)

      if (result.success) {
        $q.notify({
          type: 'positive',
          message:
            'Recurring subscription created successfully! Your subscription will automatically renew.',
          position: 'top',
          timeout: 5000,
        })
      }
    } else {
      // Use one-time payment
      result = await paymentStore.subscribeToPlan(selectedPlan.value.id)

      if (result.success) {
        $q.notify({
          type: 'positive',
          message: 'Subscription successful! Welcome to your new plan.',
          position: 'top',
          timeout: 3000,
        })
      }
    }

    if (result.success) {
      // Redirect to current subscription page to show the new subscription
      router.push('/current-subscription')
    } else {
      throw new Error(result.message || 'Failed to process subscription')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to process subscription. Please try again.',
      position: 'top',
      timeout: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Promo code API call
// async function applyPromoCode() {
//   if (!promoCode.value.trim()) return

//   promoLoading.value = true
//   promoMessage.value = ''
//   promoSuccess.value = false
//   promoApplied.value = false
//   appliedPromoDetails.value = null

//   try {
//     if (!authStore.user?.id) {
//       throw new Error('User not authenticated')
//     }

//     // Use V2 API endpoint for promo codes
//     const formData = new FormData()
//     formData.append('user_id', String(authStore.user.id))
//     formData.append('code', promoCode.value.trim().toUpperCase())

//     const response = await api.post('/v2/promocode/apply', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     })

//     const data = response.data
//     if (data.success) {
//       promoSuccess.value = true
//       promoApplied.value = true
//       promoMessage.value = data.message || 'Promo code applied successfully!'
//       appliedPromoDetails.value = data.data || {}

//       // Update user details to reflect new subscription
//       await authStore.fetchUserDetails()

//       $q.notify({
//         type: 'positive',
//         message: 'Promo code applied successfully! Your subscription is now active.',
//         position: 'top',
//         timeout: 5000,
//       })

//       // Redirect to current subscription page after successful promo application
//       setTimeout(() => {
//         router.push('/current-subscription')
//       }, 1500)
//     } else {
//       promoSuccess.value = false
//       promoMessage.value = data.message || 'Invalid promo code.'
//     }
//   } catch (error) {
//     console.error('Promo code error:', error)
//     promoSuccess.value = false
//     promoMessage.value =
//       error.response?.data?.message ||
//       'An error occurred while applying the promo code. Please try again.'
//   } finally {
//     promoLoading.value = false
//   }
// }
</script>

<style lang="scss" scoped>
.container {
  padding-top: 2rem;
}

.border-left {
  border-left: 3px solid var(--q-primary);
  background: rgba(var(--q-primary-rgb), 0.05);
  border-radius: 0 4px 4px 0;
}
</style>
