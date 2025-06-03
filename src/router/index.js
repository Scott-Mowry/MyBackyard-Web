import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import routes, { setupRouterGuard } from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const Router = createRouter({
    scrollBehavior(to, from, savedPosition) {
      if (to.hash) {
        return {
          el: to.hash,
          behavior: 'smooth',
          top: 70, // Offset for the header height
        }
      }
      return savedPosition || { left: 0, top: 0 }
    },
    routes,
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
  })

  // Setup router guard
  setupRouterGuard(Router)

  return Router
})
