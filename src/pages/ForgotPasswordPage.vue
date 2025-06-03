<template>
  <q-page class="flex flex-center">
    <div class="auth-content-wrapper">
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          v-model="email"
          label="Email"
          type="email"
          :rules="[
            (val) => !!val || 'Email is required',
            (val) => isValidEmail(val) || 'Please enter a valid email',
          ]"
          outlined
        />

        <q-btn
          type="submit"
          color="primary"
          label="Send Reset Link"
          class="full-width"
          :loading="loading"
          unelevated
        />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const email = ref('')

function isValidEmail(email) {
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
  return emailPattern.test(email)
}

async function onSubmit() {
  loading.value = true
  try {
    // TODO: Implement password reset request
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call

    $q.notify({
      type: 'positive',
      message: 'Password reset instructions have been sent to your email.',
    })
    email.value = ''
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to send reset instructions. Please try again.',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-content-wrapper {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}
</style>
