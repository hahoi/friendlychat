
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // { path: '', component: () => import('pages/Index.vue') },
      { path: '', component: () => import('pages/PageHome.vue') },
      { path: 'auth', component: () => import('pages/PageAuth.vue') },
      { path: 'customer', component: () => import('pages/PageCustomer.vue') },
      { path: 'repair', component: () => import('pages/PageRepair.vue') },
      { path: 'message', component: () => import('pages/PageMessage.vue') },
      { path: 'admin', component: () => import('pages/PageAdmin.vue') },
      { path: 'engineer', component: () => import('pages/PageEngineer.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
