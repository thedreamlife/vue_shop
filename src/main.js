import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './icons/icons.css'
import TreeTable from 'vue-table-with-tree-grid'
// import http from './http/http'
Vue.config.productionTip = false
    // Vue.prototype.$http = http
Vue.component('tree-table', TreeTable)
new Vue({
    router,
    render: h => h(App)
}).$mount('#app')