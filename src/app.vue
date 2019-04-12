<template>
    <div class="app-container">
        <a-locale-provider :locale="locale">
            <a-layout id="components-layout-demo-custom-trigger">
                <a-layout-sider
                        :trigger="null"
                        collapsible
                        v-model="collapsed"
                >
                    <div class="logo" />
                    <div class="avatar"><img src="./images/spider.jpg" alt=""><p>管理员</p></div>
                    <a-menu theme="dark" mode="inline" :defaultSelectedKeys="[hashAddress]" :selectedKeys="[hashAddress]">
                        <a-menu-item key="dashboard">
                            <router-link to="/dashboard"><a-icon type="compass" /><span> 仪表盘</span></router-link>
                        </a-menu-item>
                        <a-sub-menu key="sub1">
                            <span slot="title"><a-icon type="profile" /><span> 文章</span></span>
                            <a-menu-item key="posts"><router-link to="/posts">所有文章</router-link></a-menu-item>
                            <a-menu-item key="addPost"><router-link to="/addPost">写文章</router-link></a-menu-item>
                            <a-menu-item key="category"><router-link to="/category">分类目录</router-link></a-menu-item>
                        </a-sub-menu>
                        <a-menu-item key="5">
                            <a-icon type="team" />
                            <span>用户</span>
                        </a-menu-item>
                        <a-sub-menu key="sub2">
                            <span slot="title"><a-icon type="setting" /><span> 设置</span></span>
                            <a-menu-item key="6">个人中心</a-menu-item>
                            <a-menu-item key="7">我的标签</a-menu-item>
                        </a-sub-menu>
                    </a-menu>
                </a-layout-sider>
                <a-layout>
                    <a-layout-header style="background: #fff; padding: 0; display: flex; justify-content: space-between">
                        <a-icon
                                class="trigger"
                                :type="collapsed ? 'menu-unfold' : 'menu-fold'"
                                @click="()=> collapsed = !collapsed"
                        />
                        <div class="logout">
                            <span class="user" style="margin-right: 24px"><a-icon type="user" /><span> 个人中心</span></span>
                            <span class="signOut" style="margin-right: 24px" @click="signOut"><a-icon type="logout"/><span> 退出</span></span>
                        </div>
                    </a-layout-header>
                    <a-layout-content :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px',height:'100%' }">
                        <router-view></router-view>
                    </a-layout-content>
                </a-layout>
            </a-layout>
        </a-locale-provider>

    </div>
</template>

<script>
    import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';
    export default {
        name: "app",
        data(){
            return {
                collapsed: false,
                hashAddress: this.$route.path.substr(1),
                locale: zhCN,
                rootUrl: this.$store.state.rootUrl,
            }
        },
        created() {

        },
        watch:{
            $route(to,from){
                this.hashAddress = to.path.substr(1)
            }
        },
        methods: {
            signOut () {
                this.$confirm({
                    title: `你确定要退出登录吗？`,
                    content: '',
                    okText: '是的',
                    okType: 'danger',
                    cancelText: '否',
                    onOk: () => {
                        this.$axios.get(this.rootUrl + '/logout')
                            .then(results => {
                                let data = results.data;
                                if (data['err_code'] == 200) {
                                    location.href = this.rootUrl + '/login';
                                } else{

                                }
                            })
                            .catch(err => {

                            })
                    },
                    onCancel: () => {

                    }
                });
            }
        }
    }
</script>

<style lang="less">
    .app-container {
        height: 100%;
        #components-layout-demo-custom-trigger {
            height: 100%;
            .logo {
                height: 32px;
                background: rgba(255,255,255,.2);
                margin: 16px;
            }
            .avatar {
                img {
                    display: block;
                    height: 70px;
                    width: 70px;
                    border-radius: 50%;
                    margin: 0 auto;
                    object-fit: cover;
                    border: 3px solid rgba(255, 255, 255, .3);
                }
                p {
                    margin-top: 10px;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.65);
                }

            }
            .trigger {
                font-size: 18px;
                line-height: 64px;
                padding: 0 24px;
                cursor: pointer;
                transition: color .3s;
            }
            .trigger:hover {
                color: #1890ff;
            }
        }
        .logout {
            span {
                cursor: pointer;
            }
            span:hover {
                color: #40a9ff;
            }
        }
    }
    body {
        .ant-modal-success {
            transform-origin: unset!important;
        }
    }

</style>