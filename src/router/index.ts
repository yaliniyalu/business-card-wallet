import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Home from "@/views/Home.vue";
import Edit from "@/views/Edit.vue";
import View from "@/views/View.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/list'
  },
  {
    path: '/list',
    name: 'Home',
    component: Home
  },
  {
    path: '/edit/:id',
    name: 'Edit',
    component: Edit
  },
  {
    path: '/view/:id',
    name: 'View',
    component: View
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
