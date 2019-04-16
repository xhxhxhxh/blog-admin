import VueRouter from 'vue-router';
import Dashboard from './components/Dashboard/Dashboard.vue';
import Posts from './components/Posts/Posts.vue';
import AddPost from './components/Posts/AddPost.vue';
import EditPost from './components/Posts/EditPost.vue';
import PostDetail from './components/Posts/PostDetail.vue';
import Category from './components/Category/Category.vue';
import User from './components/User/User.vue';
import ResetPassword from './components/User/ResetPassword.vue';
import MyTags from './components/Tags/MyTags.vue';

const router = new VueRouter ({
    routes: [
        { path: '/', redirect: '/dashboard' },
        { path: '/dashboard', component: Dashboard },
        { path: '/posts', component: Posts },
        { path: '/addPost', component: AddPost },
        { path: '/post/detail/:id', component: PostDetail },
        { path: '/post/edit/:id', component: EditPost },
        { path: '/category', component: Category },
        { path: '/user', component: User },
        { path: '/resetPassword', component: ResetPassword },
        { path: '/myTags', component: MyTags },
    ]
});

export default router;