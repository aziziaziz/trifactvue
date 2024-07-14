/* eslint-disable */
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from) => {
  if (to.name == 'Login') {
    document.title = 'Tri-Factor'
  } else {
    document.title = `Tri-Factor - ${to.name}`;
  }
});

export default router
