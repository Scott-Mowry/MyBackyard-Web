<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1200px">
      <div class="text-h4 text-center q-mb-xl">Choose Your Plan</div>

      <!-- Subscription Plans Grid -->
      <div class="row q-col-gutter-lg justify-center">
        <div v-for="plan in paymentStore.subscriptions" :key="plan.id" class="col-12 col-md-4">
          <q-card class="subscription-card" :class="{ premium: plan.name === 'Premium Package' }">
            <q-card-section class="text-center">
              <q-chip
                v-if="plan.name === 'Premium Package'"
                color="primary"
                text-color="white"
                class="q-mb-sm"
                >Most Popular</q-chip
              >
              <div class="text-h5 q-mb-sm">{{ plan.name }}</div>
              <div class="text-subtitle1 text-grey-8 q-mb-sm">{{ plan.role }}</div>
              <div class="text-h3 text-primary q-mb-md">
                ${{ plan.price }}<span class="text-subtitle2">/{{ plan.type.toLowerCase() }}</span>
              </div>
              <q-list>
                <q-item v-for="(point, index) in plan.sub_points" :key="index">
                  <q-item-section avatar>
                    <q-icon name="check" color="positive" />
                  </q-item-section>
                  <q-item-section>{{ point }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-card-actions align="center" class="q-pa-md">
              <q-btn
                label="Select Plan"
                color="primary"
                :loading="paymentStore.loading"
                @click="handleSubscribe(plan)"
                unelevated
                class="full-width"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentStore } from 'stores/payment'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()

async function handleSubscribe(plan) {
  // Check if user is logged in
  if (!authStore.user) {
    // Redirect to login with return path and plan ID
    router.push({
      name: 'login',
      query: {
        redirect: '/subscription-plans',
        plan: plan.id,
      },
    })
    return
  }

  // Check if user has payment profile
  if (!authStore.user.payment_profile_id) {
    // Redirect to add payment method with plan ID
    router.push({
      name: 'add-payment-method',
      query: { plan: plan.id },
    })
    return
  }

  // If user is logged in and has payment profile, proceed to payment page
  router.push({
    name: 'payment',
    query: { plan: plan.id },
  })
}

onMounted(async () => {
  await paymentStore.fetchSubscriptions()
})
</script>

<style lang="scss" scoped>
.container {
  padding-top: 2rem;
}

.subscription-card {
  height: 100%;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  &.premium {
    border: 2px solid var(--q-primary);
  }
}

.text-h3 {
  .text-subtitle2 {
    font-size: 1rem;
    opacity: 0.7;
  }
}
</style>
