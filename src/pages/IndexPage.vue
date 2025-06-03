<template>
  <q-page>
    <!-- Hero Section -->
    <section class="hero-section q-pa-xl text-center">
      <div class="container q-mx-auto" style="max-width: 1200px">
        <div class="text-h2 text-weight-bold q-mb-md">Welcome to My Backyard</div>
        <div class="text-h4 text-weight-medium q-mb-lg">
          Platform for<br />
          Local Businesses<br />
          which includes
        </div>

        <!-- Business Categories Grid -->
        <div class="business-categories q-mb-xl">
          <div class="row q-col-gutter-md justify-center">
            <div
              v-for="category in businessCategories"
              :key="category.name"
              class="col-6 col-sm-4 col-md-3 col-lg-2"
            >
              <q-card class="category-card text-center">
                <q-card-section>
                  <q-icon :name="category.icon" size="2rem" color="primary" class="q-mb-sm" />
                  <div class="text-subtitle1">{{ category.name }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <q-btn
          color="primary"
          size="lg"
          label="Download App"
          :to="{ path: '/', hash: '#download' }"
          unelevated
          class="q-mt-xl"
        />
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about-section q-pa-xl">
      <div class="container q-mx-auto" style="max-width: 1200px">
        <div class="text-h4 text-weight-bold text-center q-mb-xl">About our App</div>
        <div class="text-body1 text-center q-mb-xl">
          My Backyard is a vibrant online platform dedicated to connecting local, family-owned
          businesses with customers who want to make a difference in their community. It's a space
          where businesses can thrive by offering exclusive discounts and promotions to customers
          who are passionate about supporting their neighbors. The name "My Backyard" symbolizes the
          idea that each local business is a part of the community, like a beloved corner of your
          own backyard.
        </div>

        <div class="text-h5 text-weight-bold text-center q-mb-lg">How The App Works</div>
        <div class="row q-col-gutter-lg">
          <div v-for="step in appSteps" :key="step.title" class="col-12 col-md-6 col-lg-3">
            <q-card class="step-card">
              <q-card-section class="text-center">
                <div class="step-number q-mb-md">{{ step.number }}</div>
                <div class="text-h6 q-mb-sm">{{ step.title }}</div>
                <p class="text-body1">{{ step.description }}</p>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="pricing-section q-pa-xl">
      <div class="container q-mx-auto" style="max-width: 1200px">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 q-mb-md">Choose Your Plan</h2>
          <p class="text-h6 text-grey-8">Select the perfect plan for your needs</p>
        </div>

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
                  ${{ plan.price
                  }}<span class="text-subtitle2">/{{ plan.type.toLowerCase() }}</span>
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
                  color="primary"
                  label="Subscribe Now"
                  :loading="paymentStore.loading"
                  @click="handleSubscriptionClick(plan)"
                  unelevated
                  class="full-width"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact-section q-pa-xl">
      <div class="container q-mx-auto" style="max-width: 800px">
        <div class="text-h4 text-weight-bold text-center q-mb-xl">Contact Us</div>
        <div class="text-subtitle1 text-center q-mb-xl">
          In this form, select the option that best describes your needs. If you are a business
          owner, customer, referral or a referral partner, fill out your name, email, phone number,
          and any comments or questions you may have.
        </div>

        <q-card class="q-pa-lg">
          <q-form @submit="onContactSubmit" class="q-gutter-md">
            <q-select
              v-model="form.type"
              :options="contactTypes"
              label="Select an Option"
              outlined
              :rules="[(val) => !!val || 'Please select an option']"
            />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.name"
                  label="Name"
                  outlined
                  :rules="[(val) => !!val || 'Name is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.email"
                  label="Email"
                  type="email"
                  outlined
                  :rules="[
                    (val) => !!val || 'Email is required',
                    (val) => isValidEmail(val) || 'Please enter a valid email',
                  ]"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="form.phone" label="Phone Number" mask="(###) ###-####" outlined />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.zipCode" label="Zip Code" mask="#####" outlined />
              </div>
            </div>

            <q-input
              v-model="form.message"
              label="Message"
              type="textarea"
              outlined
              rows="4"
              :rules="[(val) => !!val || 'Message is required']"
            />

            <q-btn
              type="submit"
              color="primary"
              label="Submit"
              class="full-width"
              :loading="loading"
              unelevated
            />
          </q-form>
        </q-card>
      </div>
    </section>

    <!-- Download App Section -->
    <section class="download-section q-pa-xl text-center" id="download">
      <div class="container q-mx-auto" style="max-width: 800px">
        <div class="text-h4 text-weight-bold q-mb-md">Download Our App Today</div>
        <div class="text-subtitle1 q-mb-lg">
          Download our app today and start enjoying the benefits of our service. Our app is
          available on both iOS and Android platforms, so you can access it from your smartphone or
          tablet.
        </div>
        <div class="row justify-center q-gutter-md">
          <a
            href="https://apps.apple.com/us/app/my-backyard-usa/id6448701879"
            target="_blank"
            rel="noopener noreferrer"
            class="app-store-btn"
          >
            <img src="/appleapp.png" alt="Download on App Store" style="height: 48px" />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.mybackyardusa.app"
            target="_blank"
            rel="noopener noreferrer"
            class="app-store-btn"
          >
            <img src="/googleplay.png" alt="Get it on Google Play" style="height: 48px" />
          </a>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePaymentStore } from 'stores/payment'
import { useAuthStore } from 'stores/auth'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const loading = ref(false)
const paymentStore = usePaymentStore()
const router = useRouter()
const authStore = useAuthStore()

const businessCategories = ref([
  { name: 'Beauty', icon: 'spa' },
  { name: 'Medical Services', icon: 'medical_services' },
  { name: 'Bakery', icon: 'bakery_dining' },
  { name: 'Coffee Shop', icon: 'local_cafe' },
  { name: 'Family Fun', icon: 'family_restroom' },
  { name: 'Home Services', icon: 'home' },
  { name: 'Food', icon: 'restaurant' },
  { name: 'Beverage', icon: 'local_bar' },
  { name: 'Entertainment', icon: 'theater_comedy' },
  { name: 'Recreation', icon: 'sports_basketball' },
  { name: 'Retail', icon: 'shopping_bag' },
  { name: 'Boutique', icon: 'store' },
  { name: 'Travel', icon: 'flight' },
  { name: 'Flower Services', icon: 'local_florist' },
  { name: 'Sports', icon: 'sports_soccer' },
  { name: 'Fitness', icon: 'fitness_center' },
  { name: 'Professional Services', icon: 'business' },
  { name: 'Pets', icon: 'pets' },
  { name: 'Pool & Lawn Services', icon: 'pool' },
  { name: 'Health', icon: 'health_and_safety' },
])

const appSteps = ref([
  {
    number: '1',
    title: 'Sign-Up',
    description:
      'Open the app and go to signup screen to create an account. You can sign up using your email address & password.',
  },
  {
    number: '2',
    title: 'Verify',
    description:
      'Once you have created your account, you will receive an OTP on your email. Open your email, check the OTP and enter it in the app.',
  },
  {
    number: '3',
    title: 'Complete Profile',
    description:
      'After verifying your email, you will be redirected to the profile screen. Here you can enter your personal information like name, address, phone number, etc.',
  },
  {
    number: '4',
    title: 'Subscribe & Enjoy',
    description:
      'Once you have completed your profile, subscribe to the plan that best fits your needs. You can choose from monthly or yearly plans.',
  },
])

const contactTypes = [
  "I'm a Business",
  "I'm a Consumer",
  'I have a Referral',
  'I would like to become a Referral Partner',
]

const form = ref({
  type: null,
  name: '',
  email: '',
  phone: '',
  zipCode: '',
  message: '',
})

function isValidEmail(email) {
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
  return emailPattern.test(email)
}

async function onContactSubmit() {
  loading.value = true
  try {
    // TODO: Implement contact form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    $q.notify({
      type: 'positive',
      message: 'Thank you for your message! We will get back to you soon.',
    })

    // Reset form
    form.value = {
      type: null,
      name: '',
      email: '',
      phone: '',
      zipCode: '',
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

async function handleSubscriptionClick(plan) {
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
.hero-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  padding: 80px 20px;
}

.about-section {
  background: white;
  padding: 80px 20px;
}

.pricing-section {
  background: linear-gradient(135deg, #e4e8eb 0%, #f5f7fa 100%);
  padding: 80px 20px;
}

.contact-section {
  background: white;
  padding: 80px 20px;
}

.download-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  padding: 80px 20px;
}

.business-categories {
  max-width: 1200px;
  margin: 0 auto;
}

.category-card {
  height: 100%;
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
  }
}

.step-card {
  height: 100%;
  position: relative;
  padding-top: 40px;

  .step-number {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: var(--q-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
  }
}

.subscription-card {
  height: 100%;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.container {
  padding: 20px;
}

// Smooth scroll behavior
html {
  scroll-behavior: smooth;
}

.app-store-btn {
  display: inline-block;
  transition: transform 0.2s ease;
  text-decoration: none;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>
