<template>
  <q-layout view="lHh Lpr lff">
    <q-header elevated class="bg-dark text-primary">
      <q-toolbar class="q-px-md">
        <!-- Logo -->
        <q-toolbar-title class="row items-center">
          <img src="/logo-1.png" alt="My Backyard USA" style="height: 40px" class="q-mr-sm" />
          <span class="text-h6 text-weight-bold">MY BACKYARD</span>
        </q-toolbar-title>

        <!-- Navigation -->
        <div class="row items-center q-gutter-x-md gt-sm">
          <q-btn
            v-for="item in navigationItems"
            :key="item.label"
            flat
            :to="item.to"
            :label="item.label"
            class="text-weight-medium"
          />
        </div>

        <!-- Auth Buttons -->
        <div class="row items-center q-ml-md">
          <template v-if="authStore.user && Object.keys(authStore.user).length > 0">
            <q-btn-dropdown flat :label="authStore.user?.name" class="text-weight-medium">
              <q-list>
                <q-item clickable v-close-popup @click="goToProfile">
                  <q-item-section>
                    <q-item-label>Profile</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section>
                    <q-item-label>Logout</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </template>
          <template v-else>
            <q-btn flat label="Login" to="/auth/login" class="text-weight-medium" />
            <q-btn
              unelevated
              color="primary"
              label="Download"
              :to="{ path: '/', hash: '#download' }"
              class="q-ml-sm"
            />
          </template>
        </div>

        <!-- Mobile Menu -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="lt-md"
          @click="toggleRightDrawer"
        />
      </q-toolbar>

      <!-- Mobile Navigation Drawer -->
      <q-drawer v-model="rightDrawerOpen" side="right" bordered>
        <q-list>
          <q-item-label header>Navigation</q-item-label>
          <q-item
            v-for="item in navigationItems"
            :key="item.label"
            clickable
            v-ripple
            :to="item.to"
          >
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <template v-if="authStore.user && Object.keys(authStore.user).length > 0">
            <q-item clickable v-ripple @click="goToProfile">
              <q-item-section>
                <q-item-label>Profile</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="handleLogout">
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <q-item clickable v-ripple to="/auth/login">
              <q-item-section>
                <q-item-label>Login</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section>
                <q-item-label>Download App</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-drawer>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <q-footer class="bg-dark text-white q-pa-lg">
      <div class="container q-mx-auto" style="max-width: 1200px">
        <div class="row q-col-gutter-lg">
          <!-- Contact Info -->
          <div class="col-12 col-md-4">
            <div class="text-h6 q-mb-md">Contact</div>
            <div class="q-gutter-y-sm">
              <div class="row items-center">
                <q-icon name="email" size="sm" class="q-mr-sm" />
                <span>mybackyardtx@gmail.com</span>
              </div>
              <div class="row items-center">
                <q-icon name="phone" size="sm" class="q-mr-sm" />
                <span>(+1) 716 997-4674</span>
              </div>
            </div>
          </div>

          <!-- Site Links -->
          <div class="col-12 col-md-4">
            <div class="text-h6 q-mb-md">Site Links</div>
            <div class="q-gutter-x-sm">
              <q-btn
                v-for="item in navigationItems"
                :key="item.label"
                flat
                :to="item.to"
                :label="item.label"
                class="text-weight-medium"
              />
              <q-btn flat dense label="Terms" to="/terms" />
              <q-btn flat dense label="Privacy" to="/privacy" class="text-weight-medium" />
            </div>
          </div>

          <!-- Newsletter -->
          <div class="col-12 col-md-4">
            <div class="text-h6 q-mb-md">Our Newsletter</div>
            <p class="text-body2 q-mb-md">
              Subscribe to our newsletter and stay updated with the latest news, offers, and
              promotions from My Backyard.
            </p>
            <q-form @submit="onNewsletterSubmit" class="q-gutter-md">
              <q-input
                v-model="newsletterEmail"
                type="email"
                label="Email"
                outlined
                dark
                dense
                :rules="[
                  (val) => !!val || 'Email is required',
                  (val) => isValidEmail(val) || 'Please enter a valid email',
                ]"
              />
              <q-btn type="submit" color="primary" label="Subscribe" unelevated />
            </q-form>
          </div>
        </div>

        <q-separator color="grey-8" class="q-my-lg" />

        <div class="text-center text-caption">
          &copy; {{ new Date().getFullYear() }} My Backyard USA. All rights reserved.
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()
const rightDrawerOpen = ref(false)
const newsletterEmail = ref('')

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: { path: '/', hash: '#about' } },
  { label: 'Pricing', to: { path: '/', hash: '#pricing' } },
  { label: 'Contact', to: { path: '/', hash: '#contact' } },
]

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function goToProfile() {
  router.push('/profile')
}

function isValidEmail(email) {
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
  return emailPattern.test(email)
}

async function onNewsletterSubmit() {
  try {
    // TODO: Implement newsletter subscription
    await new Promise((resolve) => setTimeout(resolve, 1000))
    $q.notify({
      type: 'positive',
      message: 'Thank you for subscribing to our newsletter!',
    })
    newsletterEmail.value = ''
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to subscribe. Please try again.',
    })
  }
}
</script>

<style lang="scss" scoped>
.q-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.q-toolbar {
  min-height: 70px;
}

.q-footer {
  .q-input {
    .q-field__control {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
