<template>
  <q-page class="q-pa-md">
    <div class="container q-mx-auto" style="max-width: 800px">
      <div class="text-h4 text-weight-bold q-mb-lg">Contact Us</div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-6">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Get in Touch</div>
              <p class="text-body1 q-mb-lg">
                Have questions or feedback? We'd love to hear from you. Fill out the form and we'll
                get back to you as soon as possible.
              </p>

              <div class="q-gutter-y-md">
                <div class="row items-center">
                  <q-icon name="location_on" color="primary" size="1.5rem" class="q-mr-sm" />
                  <span>123 Main Street, City, State 12345</span>
                </div>
                <div class="row items-center">
                  <q-icon name="phone" color="primary" size="1.5rem" class="q-mr-sm" />
                  <span>(555) 123-4567</span>
                </div>
                <div class="row items-center">
                  <q-icon name="email" color="primary" size="1.5rem" class="q-mr-sm" />
                  <span>contact@mybackyardusa.com</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card class="q-pa-md">
            <q-card-section>
              <q-form @submit="onSubmit" class="q-gutter-md">
                <q-input
                  v-model="form.name"
                  label="Name"
                  :rules="[(val) => !!val || 'Name is required']"
                  outlined
                />

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
                  v-model="form.subject"
                  label="Subject"
                  :rules="[(val) => !!val || 'Subject is required']"
                  outlined
                />

                <q-input
                  v-model="form.message"
                  label="Message"
                  type="textarea"
                  :rules="[(val) => !!val || 'Message is required']"
                  outlined
                  rows="4"
                />

                <div>
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Send Message"
                    class="full-width"
                    :loading="loading"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

function isValidEmail(email) {
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
  return emailPattern.test(email)
}

async function onSubmit() {
  loading.value = true
  try {
    // TODO: Implement contact form submission
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call

    $q.notify({
      type: 'positive',
      message: "Message sent successfully! We'll get back to you soon.",
    })

    // Reset form
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: '',
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to send message. Please try again.',
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
