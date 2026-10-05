import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import { authStore } from '@/stores/auth-store'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'

function requireAuth(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  if (authStore.state.user && authStore.state.token) {
    next()
  } else {
    next('/login')
  }
}

function requireGuest(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  if (authStore.state.user && authStore.state.token) {
    next('/')
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: requireGuest
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: requireAuth
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router
