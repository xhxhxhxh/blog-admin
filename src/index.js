import Vue from 'vue';
import VueRouter from 'vue-router';
import router from './router';
import app from './app.vue';
import './css/base.css';
import axios from 'axios'
import { Layout, Menu, Icon, Button, Card, Select, Pagination, Table, Tag, Input, Alert, Spin, message, Modal, LocaleProvider, Popconfirm } from 'ant-design-vue';
import Vuex from 'vuex';

Vue.config.productionTip = false;
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.withCredentials = true;
Vue.prototype.$axios= axios;
Vue.prototype.$message = message;
Vue.prototype.$confirm = Modal.confirm;
Vue.prototype.$success = Modal.success;

message.config({
    maxCount: 3,
});

//全局组件
Vue.use(Layout);
Vue.use(Menu);
Vue.use(Icon);
Vue.use(Button);
Vue.use(Card);
Vue.use(Select);
Vue.use(Pagination);
Vue.use(Table);
Vue.use(Tag);
Vue.use(Input);
Vue.use(Alert);
Vue.use(Spin);
Vue.use(Modal);
Vue.use(LocaleProvider);
Vue.use(Popconfirm);



Vue.use(VueRouter);
Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        rootUrl: 'http://localhost:5000'
    }
});

new Vue({
    el: '#app',
    data: {
        message: '哈哈哈'
    },
    render: c => c(app),
    router,
    store
});