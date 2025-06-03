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
                (val) => val.length === 16 || 'Card number must be 16 digits',
              ]"
            />

            <!-- Card Holder Name -->
            <q-input
              v-model="cardDetails.card_holder_name"
              label="Card Holder Name"
              :rules="[(val) => !!val || 'Card holder name is required']"
            />

            <!-- Expiry Date -->
            <q-input
              v-model="cardDetails.expiry_date"
              label="Expiry Date"
              mask="##/##"
              placeholder="MM/YY"
              :rules="[
                (val) => !!val || 'Expiry date is required',
                (val) => /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(val) || 'Invalid expiry date (MM/YY)',
              ]"
            />

            <!-- CCV -->
            <q-input
              v-model="cardDetails.ccv"
              label="CCV"
              mask="###"
              unmasked-value
              :rules="[
                (val) => !!val || 'CCV is required',
                (val) => val.length === 3 || 'CCV must be 3 digits',
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePaymentStore } from 'stores/payment'

const router = useRouter()
const route = useRoute()
const paymentStore = usePaymentStore()

const cardDetails = ref({
  card_number: '',
  card_holder_name: '',
  expiry_date: '',
  ccv: '',
})

async function onSubmit() {
  const result = await paymentStore.addPaymentMethod(cardDetails.value)
  if (result.success) {
    // Check if we have a plan ID in the query
    const planId = route.query.plan
    if (planId) {
      // If we have a plan ID, redirect to payment page
      router.push({
        name: 'payment',
        query: { plan: planId },
      })
    } else {
      // Otherwise redirect to profile
      router.push('/profile')
    }
  }
}

// Check if we have a plan ID in the query
onMounted(() => {
  const planId = route.query.plan
  if (!planId) {
    // If no plan ID, redirect to subscription plans
    router.push('/subscription-plans')
  }
})
</script>

<style lang="scss" scoped>
.container {
  padding-top: 2rem;
}
</style>
