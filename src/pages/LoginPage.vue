<template>
  <q-page class="flex flex-center">
    <div class="column items-center auth-container">
      <!-- Logo -->
      <div class="text-center q-mb-lg">
        <q-img src="/logo-1.png" style="width: 180px; height: auto" class="logo-image" />
      </div>

      <q-form @submit="onSubmit" class="q-gutter-y-sm full-width">
        <q-input
          v-model="form.email"
          label="Email"
          type="email"
          :rules="[
            (val) => !!val || 'Email is required',
            (val) => isValidEmail(val) || 'Please enter a valid email',
          ]"
          outlined
          dense
        />

        <q-input
          v-model="form.password"
          label="Password"
          :type="isPwd ? 'password' : 'text'"
          :rules="[(val) => !!val || 'Password is required']"
          outlined
          dense
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <!-- <div class="row justify-between items-center q-mt-sm">
          <q-checkbox v-model="form.remember" label="Remember me" dense />
          <q-btn
            flat
            dense
            label="Forgot Password?"
            to="/auth/forgot-password"
            class="text-primary"
          />
        </div> -->

        <q-btn
          type="submit"
          color="primary"
          label="Sign In"
          class="full-width q-mt-md"
          :loading="loading"
          unelevated
        />

        <!-- <div class="text-center q-mt-sm">
          <div class="text-body2">
            Don't have an account?
            <q-btn flat dense label="Sign Up" to="/auth/register" class="text-primary" />
          </div>
        </div> -->
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(false)
const isPwd = ref(true)

const form = ref({
  email: '',
  password: '',
  remember: false,
})

function isValidEmail(email) {
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
  return emailPattern.test(email)
}

async function onSubmit() {
  loading.value = true
  try {
    const result = await authStore.login(form.value)
    if (result.success) {
      // Check for redirect query parameter
      const redirectPath = route.query.redirect
      const planId = route.query.plan

      if (redirectPath) {
        // If user has no payment profile and trying to subscribe, redirect to add payment
        if (redirectPath === '/subscription-plans' && !authStore.user.payment_profile_id) {
          router.push({
            name: 'add-payment-method',
            query: { plan: planId },
          })
        } else {
          // Otherwise redirect to the requested path
          router.push(redirectPath)
        }
      } else {
        // Default redirect to home
        router.push('/')
      }
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Invalid email or password',
      })
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'An error occurred. Please try again.',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.q-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  min-height: 100vh;
}

.auth-container {
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo-image {
  display: block;
  margin: 0 auto;
}
</style>
