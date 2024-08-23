/* eslint-disable */
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/Dev',
    name: 'Developer Items',
    component: () => import('../views/DevItems.vue')
  },
  {
    path: '/BuildingSelection/:id',
    name: 'Building Selection',
    component: () => import('../views/phase1/BuildingSelectionShare.vue')
  },
  {
    path: '/Home',
    name: 'Home',
    component: () => import('../views/home/HomeIndex.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        meta: { displayName: 'Current Location' },
        component: () => import('../views/home/Home.vue')
      },
      {
        path: 'SpaceReq',
        name: 'Space Requirements [Phase 1]',
        meta: { displayName: 'Space Requirements' },
        component: () => import('../views/phase1/SpaceRequirements.vue')
      },
      {
        path: 'OfficeCustom',
        name: 'Office Customization [Phase 1]',
        meta: { displayName: 'Office Customization' },
        component: () => import('../views/phase1/OfficeCustomization.vue')
      },
      {
        path: 'ProjectMilestone',
        name: 'Project Milestone [Phase 1]',
        meta: { displayName: 'Project Milestone' },
        component: () => import('../views/phase1/ProjectMilestone.vue')
      },
      {
        path: 'BuildingSelection',
        name: 'Building Selection [Phase 1]',
        meta: { displayName: 'Building Selection' },
        component: () => import('../views/phase1/BuildingSelection.vue')
      }
    ]
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
