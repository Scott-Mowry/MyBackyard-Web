<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 800px">
      <div class="text-h4 text-weight-bold q-mb-lg">Current Subscription</div>

      <!-- Unsubscribe Banner -->
      <q-banner v-if="paymentStore.unsubStatus === 1" color="orange" class="q-mb-md" icon="warning">
        <div class="text-weight-medium">
          Your subscription will be cancelled at the end of the billing period.
        </div>
        <div class="q-mt-sm">
          <q-btn
            flat
            color="primary"
            label="Undo Cancellation"
            @click="handleCancelUnsub"
            :loading="paymentStore.unsubLoading"
            class="q-mr-sm"
          />
        </div>
      </q-banner>

      <!-- Cancelled Subscription Banner -->
      <q-banner v-if="isSubscriptionCancelled" color="negative" class="q-mb-md" icon="cancel">
        <div class="text-weight-medium text-negative">⚠️ Subscription Cancelled</div>
        <div class="text-caption text-white q-mt-xs">
          Your subscription has been cancelled and will end on {{ cancellationEndDate }}. You can
          still access your account until then.
        </div>
        <div class="q-mt-sm">
          <q-btn
            flat
            color="white"
            label="Reactivate Subscription"
            @click="handleReactivate"
            :loading="paymentStore.unsubLoading"
            class="q-mr-sm"
          />
        </div>
      </q-banner>

      <!-- Success/Error Messages -->
      <q-banner
        v-if="paymentStore.unsubMessage"
        :color="unsubMessageType === 'success' ? 'positive' : 'negative'"
        class="q-mb-md"
        :icon="unsubMessageType === 'success' ? 'check_circle' : 'error'"
      >
        {{ paymentStore.unsubMessage }}
        <template v-slot:action>
          <q-btn flat color="white" label="Dismiss" @click="paymentStore.unsubMessage = ''" />
        </template>
      </q-banner>

      <q-card class="q-pa-lg">
        <q-card-section>
          <!-- Current Plan Details -->
          <div v-if="currentPlan" class="q-mb-xl">
            <div class="text-h6 q-mb-md">Your Current Plan</div>

            <!-- Recurring Subscription Status -->
            <div v-if="recurringStatus" class="q-mb-md">
              <q-card
                flat
                bordered
                class="q-pa-md"
                :class="{
                  'bg-blue-1': recurringStatus.local_status === 'active',
                  'bg-orange-1': recurringStatus.local_status === 'cancelled',
                  'bg-grey-1':
                    !recurringStatus.local_status || recurringStatus.local_status === 'none',
                }"
              >
                <div class="row items-center">
                  <q-icon
                    :name="recurringStatus.local_status === 'active' ? 'autorenew' : 'cancel'"
                    :color="recurringStatus.local_status === 'active' ? 'primary' : 'negative'"
                    size="24px"
                    class="q-mr-sm"
                  />
                  <div>
                    <div class="text-subtitle1 text-weight-medium">
                      {{ getRecurringStatusTitle() }}
                    </div>
                    <div class="text-caption text-grey-7">
                      Status: {{ recurringStatus.local_status || 'Active' }}
                      <span v-if="recurringStatus.start_date">
                        • Started: {{ formatDate(recurringStatus.start_date) }}
                      </span>
                    </div>
                  </div>
                </div>
              </q-card>
            </div>

            <q-card
              v-if="!shouldShowResubscribeButton"
              flat
              bordered
              class="q-pa-md"
              :class="{ 'cancelled-plan': isSubscriptionCancelled }"
            >
              <!-- Cancelled Status Badge -->
              <div v-if="isSubscriptionCancelled" class="text-center q-mb-md">
                <q-chip
                  color="negative"
                  text-color="white"
                  icon="cancel"
                  label="CANCELLED"
                  class="q-mb-sm"
                />
                <!-- <div class="text-caption text-negative">Access until {{ cancellationEndDate }}</div> -->
              </div>

              <div class="row items-center justify-between">
                <div>
                  <div class="text-h6">{{ currentPlan.name }}</div>
                  <div class="text-subtitle1 text-grey-8">{{ currentPlan.role }}</div>
                  <div v-if="currentPlan.description" class="text-body2 text-grey-7 q-mt-xs">
                    {{ currentPlan.description }}
                  </div>
                </div>
                <div class="text-h5 text-primary">
                  {{ currentPlan.formatted_price || `$${currentPlan.price}` }}
                  <span class="text-subtitle2"
                    >/{{ currentPlan.billing_cycle || currentPlan.type.toLowerCase() }}</span
                  >
                </div>
              </div>

              <!-- Plan Features -->
              <q-list class="q-mt-md">
                <q-item v-for="(point, index) in currentPlan.sub_points" :key="index">
                  <q-item-section avatar>
                    <q-icon name="check" color="positive" />
                  </q-item-section>
                  <q-item-section>{{ point }}</q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>

          <!-- No Subscription Message -->
          <div v-else class="text-center q-pa-lg">
            <q-icon name="subscriptions" size="4rem" color="grey-7" class="q-mb-md" />
            <div class="text-h6 q-mb-sm">
              {{ getNoSubscriptionTitle() }}
            </div>
            <p class="text-body1 text-grey-8 q-mb-lg">
              {{ getNoSubscriptionMessage() }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="row justify-center q-gutter-md">
            <!-- Recurring Subscription Management (Business users with active recurring) -->
            <template v-if="hasActiveRecurringSubscription">
              <q-btn
                color="primary"
                label="Upgrade Plan"
                :to="{ name: 'subscription-plans', query: { upgrade: 'true' } }"
                unelevated
              />
              <q-btn
                color="grey-7"
                label="Change Plan"
                :to="{ name: 'subscription-plans', query: { change: 'true' } }"
                outline
              />
              <q-btn
                color="negative"
                label="Cancel Recurring"
                @click="handleCancelRecurring"
                :loading="paymentStore.recurringLoading"
                outline
              />
            </template>

            <!-- Business users with cancelled or no recurring subscription -->
            <template v-else-if="shouldShowResubscribeButton">
              <q-btn
                color="primary"
                label="Subscribe Again"
                :to="{ name: 'subscription-plans', query: { replace: 'true' } }"
                unelevated
              />
            </template>

            <!-- Regular Subscription Management -->
            <template v-else-if="currentPlan && paymentStore.unsubStatus === 0">
              <q-btn
                color="primary"
                label="Upgrade Plan"
                :to="{ name: 'subscription-plans', query: { upgrade: 'true' } }"
                unelevated
              />
              <q-btn
                color="grey-7"
                label="Change Plan"
                :to="{ name: 'subscription-plans', query: { change: 'true' } }"
                outline
              />
              <q-btn
                color="negative"
                label="Cancel Subscription"
                @click="handleUnsubscribe"
                :loading="paymentStore.unsubLoading"
                outline
              />
            </template>

            <!-- No Subscription -->
            <q-btn
              v-if="!currentPlan && authStore.user?.role !== 'Business'"
              color="primary"
              :label="getNoSubscriptionButtonLabel()"
              :to="{ name: 'subscription-plans' }"
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
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { usePaymentStore } from 'stores/payment'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const paymentStore = usePaymentStore()
const currentPlan = computed(() => {
  // For business users, check if they have an active recurring subscription
  if (authStore.user?.role === 'Business') {
    // Only show current plan if recurring subscription is active
    if (authStore.user?.recurring_subscription_id) {
      return paymentStore.subscriptions.find((plan) => plan.id === authStore.user.sub_id) || null
    }
    // If recurring_subscription_id is null, don't show current plan
    return null
  }

  // For regular users, show current plan normally
  if (!authStore.user?.sub_id) return null
  return paymentStore.subscriptions.find((plan) => plan.id === authStore.user.sub_id) || null
})

// Recurring subscription state
const recurringStatus = ref(null)

// Computed properties for subscription status
const hasActiveRecurringSubscription = computed(() => {
  return (
    authStore.user?.role === 'Business' &&
    authStore.user?.recurring_subscription_id &&
    recurringStatus.value?.local_status === 'active'
  )
})

const hasCancelledRecurringSubscription = computed(() => {
  return authStore.user?.role === 'Business' && recurringStatus.value?.local_status === 'cancelled'
})

const shouldShowResubscribeButton = computed(() => {
  return (
    authStore.user?.role === 'Business' &&
    (hasCancelledRecurringSubscription.value || !authStore.user?.recurring_subscription_id)
  )
})

// Computed property to determine message type
const unsubMessageType = computed(() => {
  const message = paymentStore.unsubMessage
  if (message.includes('successfully') || message.includes('Successfully')) {
    return 'success'
  }
  return 'error'
})

// Check if subscription is cancelled (unsubStatus === 1)
const isSubscriptionCancelled = computed(() => {
  return paymentStore.unsubStatus === 1
})

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Calculate cancellation end date from actual subscription expiration
const cancellationEndDate = computed(() => {
  // Try to get expiration from user data first
  if (authStore.user?.subscription_expires_at) {
    const date = new Date(authStore.user.subscription_expires_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    return date
  }

  // Calculate based on subscription type and current date
  if (currentPlan.value?.type) {
    const endDate = new Date()

    switch (currentPlan.value.type.toLowerCase()) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case 'yearly':
      case 'annual':
      case 'annually':
        endDate.setFullYear(endDate.getFullYear() + 1)
        break
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7)
        break
      default:
        // Default to 30 days if type is unknown
        endDate.setDate(endDate.getDate() + 30)
    }

    const date = endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    return date
  }

  // Final fallback: 30 days from now
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 30)
  const date = endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return date
})

// Helper functions for subscription messages
function getNoSubscriptionTitle() {
  if (authStore.user?.role === 'Business') {
    if (!authStore.user?.recurring_subscription_id) {
      return 'No Active Recurring Subscription'
    }
  }
  return 'No Active Subscription'
}

function getNoSubscriptionMessage() {
  if (authStore.user?.role === 'Business') {
    if (!authStore.user?.recurring_subscription_id) {
      return "You don't have an active recurring subscription. Choose a plan to get started with automatic renewals."
    }
  }
  return "You don't have an active subscription. Choose a plan to get started."
}

function getNoSubscriptionButtonLabel() {
  if (authStore.user?.role === 'Business') {
    if (!authStore.user?.recurring_subscription_id) {
      return 'Subscribe Now'
    }
  }
  return 'View Available Plans'
}

function getRecurringStatusTitle() {
  if (!recurringStatus.value) return 'Recurring Subscription'

  switch (recurringStatus.value.local_status) {
    case 'active':
      return 'Recurring Subscription Active'
    case 'cancelled':
      return 'Recurring Subscription Cancelled'
    case 'suspended':
      return 'Recurring Subscription Suspended'
    default:
      return 'Recurring Subscription'
  }
}

onMounted(async () => {
  // If user has no subscription, redirect to subscription plans
  if (!authStore.user?.sub_id) {
    router.push('/subscription-plans')
    return
  }

  // Fetch subscriptions to get current plan details
  await paymentStore.fetchSubscriptions()

  // Check for recurring subscription status (for business users)
  if (authStore.user?.role === 'Business') {
    try {
      const result = await paymentStore.getRecurringSubscriptionStatus()
      if (result.success && result.data.status !== 'none') {
        recurringStatus.value = result.data
      }
    } catch (error) {
      console.log('No recurring subscription found:', error)
    }
  }

  // Find the current subscription plan
  // No need to manually set currentPlan; it is now computed and will update reactively
})

async function handleUnsubscribe() {
  // Show confirmation dialog
  $q.dialog({
    title: 'Cancel Subscription',
    message:
      'Are you sure you want to cancel your subscription? You will have access until the end of your current billing period.',
    persistent: true,
    ok: {
      label: 'Yes, Cancel',
      color: 'negative',
      flat: true,
    },
    cancel: {
      label: 'No, Keep Subscription',
      color: 'primary',
      flat: true,
    },
  }).onOk(async () => {
    try {
      const result = await paymentStore.unsubscribe()
      if (result.success) {
        $q.notify({
          type: 'positive',
          message:
            'Your subscription has been cancelled. You will have access until the end of your billing period.',
          position: 'top',
          timeout: 5000,
        })
      } else {
        $q.notify({
          type: 'negative',
          message: result.message || 'Failed to cancel subscription',
          position: 'top',
          timeout: 3000,
        })
      }
    } catch {
      $q.notify({
        type: 'negative',
        message: 'An error occurred while cancelling your subscription',
        position: 'top',
        timeout: 3000,
      })
    }
  })
}

async function handleCancelUnsub() {
  try {
    const result = await paymentStore.cancelUnsub()
    if (result.success) {
      $q.notify({
        type: 'positive',
        message:
          'Your subscription cancellation has been cancelled. Your subscription will continue as normal.',
        position: 'top',
        timeout: 5000,
      })
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Failed to cancel the unsubscription',
        position: 'top',
        timeout: 3000,
      })
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'An error occurred while cancelling the unsubscription',
      position: 'top',
      timeout: 3000,
    })
  }
}

async function handleReactivate() {
  try {
    const result = await paymentStore.cancelUnsub()
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Your subscription has been reactivated successfully!',
        position: 'top',
        timeout: 5000,
      })
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Failed to reactivate subscription',
        position: 'top',
        timeout: 3000,
      })
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'An error occurred while reactivating your subscription',
      position: 'top',
      timeout: 3000,
    })
  }
}

async function handleCancelRecurring() {
  // Show confirmation dialog
  $q.dialog({
    title: 'Cancel Recurring Subscription',
    message:
      'Are you sure you want to cancel your recurring subscription? This will stop automatic renewals, but you will retain access until your current period ends.',
    persistent: true,
    ok: {
      label: 'Yes, Cancel Recurring',
      color: 'negative',
      flat: true,
    },
    cancel: {
      label: 'Keep Recurring',
      color: 'primary',
      flat: true,
    },
  }).onOk(async () => {
    try {
      const result = await paymentStore.cancelRecurringSubscription()
      if (result.success) {
        $q.notify({
          type: 'positive',
          message:
            'Your recurring subscription has been cancelled successfully! Auto-renewals are now disabled.',
          position: 'top',
          timeout: 5000,
        })
        // Refresh the recurring status
        try {
          const statusResult = await paymentStore.getRecurringSubscriptionStatus()
          if (statusResult.success && statusResult.data.status !== 'none') {
            recurringStatus.value = statusResult.data
          } else {
            recurringStatus.value = null // Clear if no longer active
          }
        } catch (error) {
          console.log('Could not refresh status:', error)
          recurringStatus.value = null
        }
      } else {
        $q.notify({
          type: 'negative',
          message: result.message || 'Failed to cancel recurring subscription',
          position: 'top',
          timeout: 3000,
        })
      }
    } catch (error) {
      console.error('Cancel recurring error:', error)
      $q.notify({
        type: 'negative',
        message:
          'An error occurred while cancelling your recurring subscription. Please try again or contact support.',
        position: 'top',
        timeout: 3000,
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  padding-top: 2rem;
}

.cancelled-plan {
  border: 2px solid var(--q-negative) !important;
  background-color: rgba(244, 67, 54, 0.05);
  opacity: 0.8;

  .text-h6 {
    color: var(--q-negative);
  }

  .text-subtitle1 {
    color: var(--q-negative) !important;
  }
}

/* Recurring subscription status styling */
.bg-orange-1 {
  background-color: rgba(255, 152, 0, 0.1) !important;
  border-left: 4px solid var(--q-negative) !important;
}

.bg-blue-1 {
  background-color: rgba(33, 150, 243, 0.1) !important;
  border-left: 4px solid var(--q-primary) !important;
}

.bg-grey-1 {
  background-color: rgba(158, 158, 158, 0.1) !important;
  border-left: 4px solid var(--q-grey-6) !important;
}
</style>
