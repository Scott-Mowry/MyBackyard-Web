<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 800px">
      <div class="text-h4 text-weight-bold q-mb-lg">Current Subscription</div>

      <q-card class="q-pa-lg">
        <q-card-section>
          <!-- Current Plan Details -->
          <div v-if="currentPlan" class="q-mb-xl">
            <div class="text-h6 q-mb-md">Your Current Plan</div>
            <q-card flat bordered class="q-pa-md">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-h6">{{ currentPlan.name }}</div>
                  <div class="text-subtitle1 text-grey-8">{{ currentPlan.role }}</div>
                </div>
                <div class="text-h5 text-primary">
                  ${{ currentPlan.price }}
                  <span class="text-subtitle2">/{{ currentPlan.type.toLowerCase() }}</span>
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
            <div class="text-h6 q-mb-sm">No Active Subscription</div>
            <p class="text-body1 text-grey-8 q-mb-lg">
              You don't have an active subscription. Choose a plan to get started.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="row justify-center q-gutter-md">
            <q-btn
              v-if="currentPlan"
              color="primary"
              label="Upgrade Plan"
              :to="{ name: 'subscription-plans' }"
              unelevated
            />
            <q-btn
              v-if="currentPlan"
              color="grey-7"
              label="Change Plan"
              :to="{ name: 'subscription-plans' }"
              outline
            />
            <q-btn
              v-else
              color="primary"
              label="View Available Plans"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { usePaymentStore } from 'stores/payment'

const router = useRouter()
const authStore = useAuthStore()
const paymentStore = usePaymentStore()
const currentPlan = ref(null)

onMounted(async () => {
  // If user has no subscription, redirect to subscription plans
  if (!authStore.user?.sub_id) {
    router.push('/subscription-plans')
    return
  }

  // Fetch subscriptions to get current plan details
  await paymentStore.fetchSubscriptions()

  // Find the current subscription plan
  currentPlan.value = paymentStore.subscriptions.find((plan) => plan.id === authStore.user.sub_id)

  // If plan not found, redirect to subscription plans
  if (!currentPlan.value) {
    router.push('/subscription-plans')
  }
})
</script>

<style lang="scss" scoped>
.container {
  padding-top: 2rem;
}
</style>
