import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import PlaceListView from '../views/PlaceListView.vue'
import CommunityView from '../views/CommunityView.vue'
import StampView from '../views/StampView.vue'
import CommunityDetailView from '../views/CommunityDetailView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/places',
    name: 'places',
    component: PlaceListView,
  },
  {
    path: '/community',
    name: 'community',
    component: CommunityView,
  },
  {
    path: '/community/:id',
    name: 'CommunityDetail',
    component: CommunityDetailView
  },
  {
    path: '/stamp',
    name: 'stamp',
    component: StampView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router