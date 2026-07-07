import { createRouter, createWebHistory } from 'vue-router';
import { useStadiumStore } from '../store/useStadiumStore';

const LoginView = () => import('../views/LoginView.vue');
const FanDashboard = () => import('../views/FanDashboard.vue');
const VolunteerDashboard = () => import('../views/VolunteerDashboard.vue');
const OrganizerDashboard = () => import('../views/OrganizerDashboard.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/fan',
      name: 'fan-dashboard',
      component: FanDashboard,
      meta: { requiresAuth: true, role: 'FAN' }
    },
    {
      path: '/volunteer',
      name: 'volunteer-dashboard',
      component: VolunteerDashboard,
      meta: { requiresAuth: true, role: 'VOLUNTEER' }
    },
    {
      path: '/organizer',
      name: 'organizer-dashboard',
      component: OrganizerDashboard,
      meta: { requiresAuth: true, role: 'ORGANIZER' }
    }
  ]
});

router.beforeEach((to) => {
  const store = useStadiumStore();
  const session = store.currentSession;
  
  if (to.meta.requiresAuth && !session) {
    return { name: 'login' };
  } else if (to.meta.requiresAuth && to.meta.role && session?.role !== to.meta.role) {
    // Redirect to their respective dashboard if role doesn't match
    switch(session?.role) {
      case 'FAN': return { name: 'fan-dashboard' };
      case 'VOLUNTEER': return { name: 'volunteer-dashboard' };
      case 'ORGANIZER': return { name: 'organizer-dashboard' };
      default: return { name: 'login' };
    }
  }
});

export default router;
