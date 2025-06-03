<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 800px">
      <q-card class="q-pa-lg">
        <q-card-section>
          <div class="text-h5 q-mb-lg">Complete Your Subscription</div>

          <!-- Selected Plan Details -->
          <div v-if="selectedPlan" class="q-mb-xl">
            <div class="text-h6 q-mb-sm">Selected Plan</div>
            <q-card flat bordered class="q-pa-md">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-h6">{{ selectedPlan.name }}</div>
                  <div class="text-subtitle1 text-grey-8">{{ selectedPlan.role }}</div>
                </div>
                <div class="text-h5 text-primary">
                  ${{ selectedPlan.price }}
                  <span class="text-subtitle2">/{{ selectedPlan.type.toLowerCase() }}</span>
                </div>
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

          <!-- Submit Button -->
          <div class="row justify-end">
            <q-btn
              color="primary"
              label="Complete Subscription"
              :loading="loading"
              :disable="!termsAccepted"
              @click="handlePayment"
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

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const paymentStore = usePaymentStore()

const loading = ref(false)
const termsAccepted = ref(false)
const selectedPlan = ref(null)
const cardDetails = ref(null)

// Get the selected plan and card details
onMounted(async () => {
  const planId = route.query.plan
  if (!planId) {
    router.push('/subscription-plans')
    return
  }

  // Fetch subscriptions if not already loaded
  if (!paymentStore.subscriptions.length) {
    await paymentStore.fetchSubscriptions()
  }

  selectedPlan.value = paymentStore.subscriptions.find((p) => p.id === parseInt(planId))
  if (!selectedPlan.value) {
    router.push('/subscription-plans')
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

async function handlePayment() {
  if (!termsAccepted.value) return

  loading.value = true
  try {
    const result = await paymentStore.subscribeToPlan(selectedPlan.value.id)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Subscription successful! Welcome to your new plan.',
        position: 'top',
        timeout: 3000,
      })
      // Redirect to profile page after successful subscription
      router.push('/profile')
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
</script>

<style lang="scss" scoped>
.container {
  padding-top: 2rem;
}
</style>
