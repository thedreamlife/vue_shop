import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Welcome from '../views/Welcome.vue'
import User from '../views/user/User.vue'
import Rights from '../views/power/Rights.vue'
import Role from '../views/power/Role.vue'
import Cate from '../views/goods/Cate.vue'
Vue.use(VueRouter)

const routes = [{
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [{
                path: '/welcome',
                component: Welcome
            },
            {
                path: '/users',
                component: User

            },
            {
                path: '/rights',
                component: Rights

            },
            {
                path: '/roles',
                component: Role
            },
            {
                path: '/categories',
                component: Cate
            }

        ]
    }

]

const router = new VueRouter({
        routes
    })
    // 路由导航守卫控制访问权限必须通过登录后才能进行访问
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next()
    if (!window.sessionStorage.getItem('token'))
        return next('/login')
    next()
})

export default router