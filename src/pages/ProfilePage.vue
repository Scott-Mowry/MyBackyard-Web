<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 800px">
      <div class="text-h4 text-weight-bold q-mb-lg">My Profile</div>

      <div class="row q-col-gutter-lg">
        <!-- Profile Information -->
        <div class="col-12 col-md-4">
          <q-card class="q-pa-md">
            <q-card-section class="text-center">
              <q-avatar size="150px">
                <q-img :src="getProfileImageUrl(user?.profile_image)" :ratio="1" />
              </q-avatar>
              <div class="text-h6 q-mt-md">{{ user?.name }} {{ user?.last_name }}</div>
              <div class="text-subtitle2 text-grey">{{ user?.email }}</div>
              <div class="text-caption text-grey q-mt-sm">
                Member since {{ formatDate(user?.created_at) }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Profile Details -->
        <div class="col-12 col-md-8">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Profile Information</div>
              <q-form @submit="onSubmit" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.firstName"
                      label="First Name"
                      :rules="[(val) => !!val || 'First name is required']"
                      outlined
                      readonly
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.lastName"
                      label="Last Name"
                      :rules="[(val) => !!val || 'Last name is required']"
                      outlined
                      readonly
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
                  readonly
                />

                <q-input
                  v-model="form.phone"
                  label="Phone Number(Update in mobile app)"
                  mask="(###) ###-####"
                  outlined
                  :rules="[(val) => !!val || 'Phone number is required']"
                  readonly
                />

                <q-input
                  v-model="form.address"
                  label="Address(Update in mobile app)"
                  type="textarea"
                  outlined
                  rows="2"
                  readonly
                  :rules="[(val) => !!val || 'Address is required']"
                />

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.latitude"
                      label="Latitude(Update in mobile app)"
                      type="number"
                      outlined
                      readonly
                      :rules="[(val) => !!val || 'Latitude is required']"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.longitude"
                      label="Longitude(Update in mobile app)"
                      type="number"
                      outlined
                      readonly
                      :rules="[(val) => !!val || 'Longitude is required']"
                    />
                  </div>
                </div>

                <!-- <div>
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Update Profile"
                    class="full-width"
                    :loading="loading"
                  />
                </div> -->
              </q-form>
            </q-card-section>
          </q-card>

          <!-- Subscription Section -->
          <q-card class="q-mt-md q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Subscription</div>
              <div v-if="user?.sub_id" class="text-positive">
                <q-icon name="check_circle" size="1.5rem" class="q-mr-sm" />
                Active Subscription
                <div class="text-caption q-mt-sm">Subscription ID: {{ user.sub_id }}</div>
                <div class="q-mt-md">
                  <q-btn
                    color="primary"
                    label="View Current Plan"
                    :to="{ name: 'current-subscription' }"
                    unelevated
                  />
                </div>
              </div>
              <div v-else>
                <p class="text-body1 q-mb-md">You don't have an active subscription.</p>
                <q-btn
                  color="primary"
                  label="View Available Plans"
                  :to="{ name: 'subscription-plans' }"
                  unelevated
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()
const loading = ref(false)

const user = ref(null)
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  latitude: '',
  longitude: '',
})

function isValidEmail(email) {
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
  return emailPattern.test(email)
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getProfileImageUrl(path) {
  if (!path) return 'https://cdn.quasar.dev/img/avatar.png'
  // If the path is already a full URL, return it as is
  if (path.startsWith('http')) return path
  // Otherwise, prepend the API base URL
  return `https://admin.mybackyardusa.com/public${path}`
}

onMounted(() => {
  // Use the user data from auth store
  user.value = authStore.user
  if (user.value) {
    form.value = {
      firstName: user.value.name || '',
      lastName: user.value.last_name || '',
      email: user.value.email || '',
      phone: user.value.phone || '',
      address: user.value.address || '',
      latitude: user.value.latitude || '',
      longitude: user.value.longitude || '',
    }
  }
})

async function onSubmit() {
  loading.value = true
  try {
    // TODO: Implement profile update API call
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call

    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully!',
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update profile. Please try again.',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
}
</style>
