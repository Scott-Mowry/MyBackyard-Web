<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1200px">
      <div class="text-h4 text-center q-mb-xl">Choose Your Plan</div>

      <!-- Subscription Plans Grid -->
      <div class="row q-col-gutter-lg justify-center">
        <div
          v-for="plan in paymentStore.subscriptions"
          :key="plan.id"
          :class="['col-12', plan.id === 5 ? 'col-md-5 q-mt-lg q-mb-lg' : 'col-md-4']"
        >
          <q-card class="subscription-card" :class="{ 'highlighted-plan': plan.id === 5 }">
            <q-card-section class="text-center">
              <q-chip
                v-if="plan.id === 5"
                color="orange"
                text-color="white"
                class="q-mb-sm special-offer-chip"
                >Special Offer</q-chip
              >
              <div :class="plan.id === 5 ? 'text-h4' : 'text-h5'" class="q-mb-sm">
                {{ plan.name }}
              </div>
              <div class="text-subtitle1 text-grey-8 q-mb-sm">{{ plan.role }}</div>
              <div
                :class="[plan.id === 5 ? 'text-h2 text-orange-8' : 'text-h3 text-primary']"
                class="q-mb-md"
              >
                ${{ plan.price
                }}<span :class="plan.id === 5 ? 'text-subtitle1' : 'text-subtitle2'"
                  >/{{ plan.type.toLowerCase() }}</span
                >
              </div>
              <q-list>
                <q-item v-for="(point, idx) in plan.sub_points" :key="idx">
                  <q-item-section avatar>
                    <q-icon name="check" :color="plan.id === 5 ? 'orange' : 'positive'" />
                  </q-item-section>
                  <q-item-section>{{ point }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-card-actions align="center" class="q-pa-md">
              <q-btn
                :color="plan.id === 5 ? 'orange' : 'primary'"
                :label="plan.id === 5 ? 'Get Special Offer' : 'Select Plan'"
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

  &.highlighted-plan {
    border: 3px solid var(--q-orange-7);
    background: white;
    box-shadow: 0 8px 24px rgba(255, 152, 0, 0.2);
    transform: scale(1.05);

    .special-offer-chip {
      font-size: 1.1em;
      padding: 8px 16px;
    }

    .text-h4 {
      color: var(--q-orange-9);
      font-weight: bold;
    }

    .text-h2 {
      font-weight: bold;
    }

    &:hover {
      transform: scale(1.08);
    }
  }
}

.text-h3 {
  .text-subtitle2 {
    font-size: 1rem;
    opacity: 0.7;
  }
}
</style>
