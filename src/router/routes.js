import { useAuthStore } from 'stores/auth'

const routes = [
  {
    path: '/login',
    redirect: '/auth/login',
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('pages/AboutPage.vue'),
      },
      {
        path: 'services',
        name: 'services',
        component: () => import('pages/ServicesPage.vue'),
      },
      {
        path: 'contact',
        name: 'contact',
        component: () => import('pages/ContactPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'add-payment-method',
        name: 'add-payment-method',
        component: () => import('pages/AddPaymentMethodPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'subscription-plans',
        name: 'subscription-plans',
        component: () => import('pages/SubscriptionPlansPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'current-subscription',
        name: 'current-subscription',
        component: () => import('pages/CurrentSubscriptionPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'payment',
        name: 'payment',
        component: () => import('pages/PaymentPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: {
          guest: true,
          title: 'Welcome Back',
          description: 'Sign in to your account to continue',
          footer: {
            text: "Don't have an account?",
            link: { to: '/auth/register', label: 'Sign Up' },
          },
        },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
        meta: {
          guest: true,
          title: 'Create Account',
          description: 'Join My Backyard USA and start exploring local businesses in your area',
          footer: {
            text: 'Already have an account?',
            link: { to: '/auth/login', label: 'Sign In' },
          },
        },
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('pages/ForgotPasswordPage.vue'),
        meta: {
          guest: true,
          title: 'Forgot Password',
          description:
            "Enter your email address and we'll send you instructions to reset your password.",
          footer: {
            text: 'Remember your password?',
            link: { to: '/auth/login', label: 'Sign In' },
          },
        },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

export function setupRouterGuard(router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const token = localStorage.getItem('token')
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const isGuestOnly = to.matched.some((record) => record.meta.guest)

    // If we have a token but no user data, try to fetch user details
    if (token && !authStore.user) {
      try {
        const { success } = await authStore.fetchUserDetails()
        if (!success) {
          // Clear invalid token
          authStore.logout()
          if (requiresAuth) {
            next({ name: 'login', query: { redirect: to.fullPath } })
            return
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error)
        // Clear invalid token
        authStore.logout()
        if (requiresAuth) {
          next({ name: 'login', query: { redirect: to.fullPath } })
          return
        }
      }
    }

    // Handle authentication requirements
    if (requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else if (isGuestOnly && authStore.isAuthenticated) {
      next({ name: 'home' })
    } else {
      next()
    }
  })
}
