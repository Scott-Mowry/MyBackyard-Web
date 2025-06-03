<template>
  <q-page class="flex flex-center">
    <div class="auth-content-wrapper">
      <q-form @submit="onSubmit" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.firstName"
              label="First Name"
              :rules="[(val) => !!val || 'First name is required']"
              outlined
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.lastName"
              label="Last Name"
              :rules="[(val) => !!val || 'Last name is required']"
              outlined
            />
          </div>
        </div>

        <q-input
          v-model="form.email"
          label="Email"
          type="email"
          :rules="[
            (val) => !!val || 'Email is required',
            (val) => isValidEmail(val) || 'Please enter a valid email',
          ]"
          outlined
        />

        <q-input
          v-model="form.password"
          label="Password"
          :type="isPwd ? 'password' : 'text'"
          :rules="[
            (val) => !!val || 'Password is required',
            (val) => val.length >= 8 || 'Password must be at least 8 characters',
          ]"
          outlined
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <q-input
          v-model="form.confirmPassword"
          label="Confirm Password"
          :type="isPwd ? 'password' : 'text'"
          :rules="[
            (val) => !!val || 'Please confirm your password',
            (val) => val === form.password || 'Passwords do not match',
          ]"
          outlined
        />

        <q-checkbox
          v-model="form.acceptTerms"
          label="I accept the terms and conditions"
          :rules="[(val) => val || 'You must accept the terms and conditions']"
        />

        <q-btn
          type="submit"
          color="primary"
          label="Create Account"
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
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const loading = ref(false)
const isPwd = ref(true)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

function isValidEmail(email) {
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
  return emailPattern.test(email)
}

async function onSubmit() {
  loading.value = true
  try {
    // TODO: Implement registration
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call

    $q.notify({
      type: 'positive',
      message: 'Account created successfully! Please login.',
    })
    router.push('/auth/login')
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to create account. Please try again.',
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
