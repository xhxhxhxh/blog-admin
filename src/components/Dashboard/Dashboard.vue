<template>
    <div class="dashboard-container">
        <div class="banner">
            <h1>One Belt, One Road</h1>
            <h4>Thoughts, stories and ideas.</h4>
            <a-button type="primary" @click="toPosts">写 文 章</a-button>
        </div>
        <div class="statistics">
            <a-card title="站点内容统计：" :bordered="false" style="width: 300px">
                <p>{{count.posts}}篇文章</p>
                <p>{{count.categories}}个分类</p>
                <p>{{count.tags}}个标签</p>
            </a-card>
        </div>
        <Piechart :chartData="postsCategoryCount" :chartName="postsCategoryName"></Piechart>
    </div>
</template>

<script>
    import Piechart from '../Charts/piechart.vue';

    export default {
        name: "Dashboard",
        data () {
            return {
                count: {},
                error: null,
                postsCategoryCount: [],
                postsCategoryName: [],
                rootUrl: this.$store.state.rootUrl
            }
        },
        created () {
          this.getCount();
          this.getPostsCategoryCount();
        },
        methods: {
            toPosts () {
                this.$router.push('/addPost');
            },

            //获取文章、标签等数量
            getCount () {
                let params = ['posts', 'categories', 'tags'];
                this.$axios.get(this.rootUrl + '/getCount', {params})
                    .then(results => {
                        // console.log(results);
                        let data = results.data;
                        if (data['err_code'] == 200) {
                            // this.count = data.message.map();
                            let count = {};
                            data.message.forEach(item => {
                                for (let key in item) {
                                    count[key] = item[key];
                                }
                            });
                            this.count = count;
                        } else{
                            this.error = data.message;
                        }
                    })
                    .catch(err => {
                        // console.log(err);
                    })
            },

            //获取文章各分类数
            getPostsCategoryCount () {
                this.$axios.get(this.rootUrl + '/getPostsCategoryCount')
                    .then(results => {
                        // console.log(results);
                        let data = results.data;
                        if (data['err_code'] == 200) {
                            let dataObj = data.message;
                            let name = [];
                            dataObj.forEach(item => {
                                name.push(item.name);
                            });
                            this.postsCategoryCount = dataObj;
                            this.postsCategoryName = name;
                        } else{
                            this.error = data.message;
                        }
                    })
                    .catch(err => {
                        // console.log(err);
                    })
            }
        },
        components: {
            Piechart
        }
    }
</script>

<style lang="less" scoped>
.dashboard-container {
    position: relative;
    height: 100%;
    .banner {
        height: 300px;
        /*background-color: #eee;*/
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        h1 {
            font-size: 64px;
            text-align: center;
            margin-bottom: 10px;
        }
        h4 {
            font-size: 21px;
            font-weight: 200;
            text-align: center;
            margin-bottom: 20px;
        }
        button {
            /*letter-spacing: 1px;*/
        }
    }
    #myPieChart {
        position: absolute;
        right: -90px;
        bottom: -40px;
    }
    .statistics {
        padding: 30px;
        > div {
            border: 1px solid #e8e8e8;
            p {
                color: rgba(0, 0, 0, 0.75);
                font-weight: 500;
            }
        }
        > div:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
            border-color: rgba(0, 0, 0, 0.09);
        }
    }
}
</style>