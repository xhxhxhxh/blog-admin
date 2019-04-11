<template>
    <div class="postDetail-container">
        <header>
            <div class="category">[{{postDetail.category}}]</div>
            <div class="tag">
                <a-tag v-for="(item,index) in tagsList" :color="tags[item].color" :key="index" v-if="tags[item]">{{tags[item].tag}}</a-tag>
            </div>
        </header>
        <h1 class="title">{{postDetail.title}}</h1>
        <div class="status">
            <span>作者：{{postDetail.author}}</span>
            <span>发表日期：{{postDetail.time | formatTime}}</span>
            <span>状态：{{postDetail.status | formatStatus}}</span>
        </div>
        <div class="content">
            <p>{{postDetail.content}}</p>
        </div>
        <div class="operate" @click="editAndDelete">
            <a-button size="small" data-title="edit">编辑</a-button>
            <a-button size="small" type="danger" data-title="delete">删除</a-button>
        </div>

    </div>
</template>

<script>
    import moment from 'moment';

    export default {
        name: "PostDetail",
        data() {
            return {
                postDetail: {},
                rootUrl: 'http://localhost:3000',
                id: '',
                error: null,
                tags: {},
                tagsList: []
            }
        },
        created() {
            this.getPostDetail();
            this.getTags()
        },

        methods: {
            //获取文章详情
            getPostDetail() {
                let id = this.id = this.$route.params.id;

                this.$axios.get(this.rootUrl + '/getPostDetail?id=' + id)
                    .then(results => {
                        // console.log(results.data);
                        let data = results.data;
                        if (data['err_code'] == 200) {
                            this.postDetail = data.message;
                            this.tagsList = this.postDetail.tags.split(',');
                        } else {
                            this.error = data.message;
                        }
                    })
                    .catch(err => {
                        // console.log(err);
                    })
            },
            //获取标签
            getTags () {
                this.$axios.get(this.rootUrl + '/getTags')
                    .then(results => {
                        let data = results.data;
                        if (data['err_code'] == 200) {
                            // this.categories = data.message;
                            let tagObj = {},
                                tagArr = data.message;

                            tagArr.forEach(item => {
                                tagObj[item.id] =  {
                                    tag: item.tag,
                                    color: item.color
                                };
                            });
                            this.tags = tagObj;
                        } else{
                            this.error = data.message;
                        }
                    })
                    .catch(err => {

                    })
            },

            //编辑和删除
            editAndDelete (e) {
                let title = e.target.dataset.title;
                let id = this.id;
                if (title == 'edit') {
                    this.$router.push('/post/edit/' + id);
                } else if (title == 'delete') {
                    this.deletePost(id);
                }
            },

            //删除
            deletePost (id) {
                this.$confirm({
                    title: `你确定要删除这篇文章吗？`,
                    content: '删除后将不可恢复',
                    okText: '是的',
                    okType: 'danger',
                    cancelText: '否',
                    onOk: () => {
                        this.$axios.get(this.rootUrl + '/deletePost?id=' + id)
                            .then(results => {
                                let data = results.data;
                                if (data['err_code'] == 200) {
                                    this.$message.success('删除成功',5);
                                    this.$router.go(-1);
                                } else{
                                    this.$message.warning('删除失败',5);
                                    this.error = data.message;
                                }
                            })
                            .catch(err => {

                            })
                    },
                    onCancel: () => {

                    },
                });
            },
        },
        filters: {
            //日期格式化
            formatTime (value) {
                return moment(value).format('YYYY/MM/DD HH:mm:ss');
            },

            //状态格式化
            formatStatus (value) {
                let status = '';
                switch (value) {
                    case 'published': status = '已发布'; break;
                    case 'trash': status = '回收站'; break;
                    case 'draft': status = '已发布'; break;
                }
                return status;
            }
        }
    }
</script>

<style lang="less" scoped>
    .postDetail-container {
        header {
            display: flex;
            justify-content: space-between;
        }
        h1 {
            text-align: center;
            margin-top: 10px;
        }
        .status {
            display: flex;
            justify-content: center;
            span {
                margin-right: 20px;
            }
        }
        .content {
            margin-top: 20px;
            p {
                text-indent: 2em;
            }
        }
        .operate {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
            button {
                margin-right: 8px;
            }
        }
    }

</style>