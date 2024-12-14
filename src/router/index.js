import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/useAuthStore'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Navigation Guards
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Check if the route requires authentication
    if (to.meta.requiresAuth && !authStore.user) {
      // Redirect to login page if not authenticated
      return next('/login')
    }

    // Prevent logged-in users from accessing guest-only pages
    if (to.meta.guestOnly && authStore.user) {
      return next('/')
    }

    // Proceed to the next route
    next()
  })

  return Router
})
