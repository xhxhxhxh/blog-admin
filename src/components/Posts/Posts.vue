<template>
    <div class="posts-container">
        <div class="title">
            <span>所有文章</span>&nbsp;
            <a-button type="primary" size="small" @click="$router.push('/addPost')">写 文 章</a-button>
        </div>
        <div class="topNav">
            <div class="selected">
                <a-button
                        type="danger"
                        @click="deleteAll"
                        :disabled="!hasSelected"
                        :loading="loading"
                >
                    删除
                </a-button>
                <a-select defaultValue="all" style="width: 120px" v-model="selectedCategory">
                    <a-select-option value="all">所有分类</a-select-option>
                    <a-select-option :value="item.id" v-for="item in categories" :key="item.id">{{item.name}}</a-select-option>
                </a-select>
                <a-select defaultValue="all" style="width: 120px" v-model="selectedStatus">
                    <a-select-option value="all">所有状态</a-select-option>
                    <a-select-option :value="item.slug" v-for="item in status" :key="item.slug">{{item.name}}</a-select-option>
                </a-select>
                <a-button @click="() => {getPostsCount();getPostsList()}">筛选</a-button>
            </div>
            <div class="pagination">
                <a-pagination showQuickJumper :defaultCurrent="1" :total="totalCount" :defaultPageSize="pageSize" @change="changePage" v-model="page"/>
            </div>
        </div>
        <div class="postsList">
            <a-table :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
                     :columns="columns" :dataSource="data" :pagination="pagination" rowKey="id">
                <div slot="operate" slot-scope='text' :style="{display: 'flex', justifyContent: 'space-around'}" @click="editAndDelete">
                    <a-button size="small" data-title="check" :data-id="text.id" type="primary">查看</a-button>
                    <a-button size="small" data-title="edit" :data-id="text.id">编辑</a-button>
                    <a-button size="small" type="danger" data-title="delete" :data-id="text.id">删除</a-button>
                </div>
                <template slot="time" slot-scope='text'>{{text.time | formatTime}}</template>
                <template slot="status" slot-scope='text'>{{text.status | formatStatus}}</template>
                <div slot="tags" slot-scope='action'>
                    <a-tag v-for="(item,index) in action.tags.split(',')" :color="tags[item].color" :key="index" v-if="tags[item]">{{tags[item].tag}}</a-tag>
                </div>
            </a-table>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';

    const columns = [{
        title: '标题',
        dataIndex: 'title',
        align: 'center'
    }, {
        title: '作者',
        dataIndex: 'author',
        align: 'center'
    }, {
        title: '分类',
        dataIndex: 'category',
        align: 'center'
    }, {
        title: '标签',
        dataIndex: '',
        scopedSlots: { customRender: 'tags' },
        align: 'center',
        width: 210
    }, {
        title: '发表时间',
        dataIndex: '',
        scopedSlots: { customRender: 'time' },
        align: 'center',
    }, {
        title: '状态',
        dataIndex: '',
        scopedSlots: { customRender: 'status' },
        align: 'center'
    }, {
        title: '操作',
        dataIndex: '',
        scopedSlots: { customRender: 'operate' },
        align: 'center',
        width: 200
    }];

    const status = [
        {name: '已发布', slug:'published'},
        {name: '草稿', slug:'draft'},
        {name: '回收站', slug:'trash'}
    ];

    export default {
        name: "Posts",
        data() {
            return {
                data: [],
                columns,
                selectedRowKeys: [], // Check here to configure the default column
                loading: false,
                pagination: false,
                rootUrl: this.$store.state.rootUrl,
                error: null,
                totalCount: 1,
                page: 1,
                pageSize: 5,
                selectedCategory: 'all',
                selectedStatus: 'all',
                categories: [],
                tags: {},
                status
            }
        },
        computed: {
            hasSelected() {
                return this.selectedRowKeys.length > 0
            }
        },
        created () {
            this.getPostsCount();
            this.getPostsList();
            this.getCategories();
            this.getTags();
        },
        watch: {
            totalCount: {
                handler: function (val,oldval) {
                    // console.log(val,oldval)
                    let page = this.page;
                    if (val == 0) return;
                    if (val <= this.pageSize * (page - 1)) {
                        page --;
                        page = page <= 0? 1: page;
                        this.page = page;
                        this.getPostsList();
                    }
                }
            }
        },
        methods: {
            deleteAll () {
                this.loading = true;
                this.deletePost(this.selectedRowKeys, () => {
                    this.loading = false;
                    this.selectedRowKeys = [];
                });
            },
            onSelectChange (selectedRowKeys) {
                // console.log('selectedRowKeys changed: ', selectedRowKeys);
                this.selectedRowKeys = selectedRowKeys
            },

            //删除
            deletePost (id, callback) {
                let count = '';
                if (typeof id === 'object') {
                    count = id.length > 1? id.length: '';
                }
                this.$confirm({
                    title: `你确定要删除这${count}篇文章吗？`,
                    content: '删除后将不可恢复',
                    okText: '是的',
                    okType: 'danger',
                    cancelText: '否',
                    onOk: () => {
                        this.$axios.get(this.rootUrl + '/deletePost?id=' + id)
                            .then(results => {
                                // console.log(results.data);
                                let data = results.data;
                                if (data['err_code'] == 200) {
                                    this.$message.success('删除成功',5);
                                    this.getPostsCount();
                                    this.getPostsList();
                                    callback && callback();
                                } else{
                                    this.$message.warning('删除失败',5);
                                    this.error = data.message;
                                }
                            })
                            .catch(err => {

                            })
                    },
                    onCancel: () => {
                        this.loading = false;
                    },
                });
            },

            //编辑和删除
            editAndDelete (e) {
                let title = e.target.dataset.title;
                let id = e.target.dataset.id;
                if (title == 'edit') {
                    this.$router.push('/post/edit/' + id);
                } else if (title == 'check') {
                    this.$router.push('/post/detail/' + id);
                } else if (title == 'delete') {
                   this.deletePost(id);
                }
            },

            //页码改变
            changePage (page) {
                // this.page = page;
                this.getPostsCount();
                this.getPostsList(null,page);
            },

            //获取文章列表
            getPostsList (e,page) {
                let params = {
                    page: page || this.page,
                    size: this.pageSize,
                    status: this.selectedStatus,
                    category: this.selectedCategory
                };

                this.$axios.get(this.rootUrl + '/getPostsList', {params})
                    .then(results => {
                        // console.log(results.data);
                        let data = results.data;
                        if (data['err_code'] == 200) {
                            this.data = data.message;
                        } else{
                            this.error = data.message;
                        }
                    })
                    .catch(err => {
                        // console.log(err);
                    })
            },

            //获取文章总数
            getPostsCount () {
                let params = {
                    status: this.selectedStatus,
                    category: this.selectedCategory
                };
                this.$axios.get(this.rootUrl + '/getPostsCount', {params})
                    .then(results => {
                        let data = results.data;
                        // console.log(data);
                        if (data['err_code'] == 200) {
                           this.totalCount = data.message.num;
                        } else{
                            this.error = data.message;
                        }
                    })
                    .catch(err => {

                    })
            },
            //获取分类目录
            getCategories () {
                this.$axios.get(this.rootUrl + '/getCategories')
                    .then(results => {
                        let data = results.data;
                        if (data['err_code'] == 200) {
                            this.categories = data.message;
                        } else{
                            this.error = data.message;
                        }
                    })
                    .catch(err => {

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
        },
        filters: {
            //日期格式化
            formatTime (value) {
                return moment(value).format('YYYY-MM-DD HH:mm:ss');
            },

            //状态格式化
            formatStatus (value) {
                let status = '';
                switch (value) {
                    case 'published': status = '已发布'; break;
                    case 'trash': status = '回收站'; break;
                    case 'draft': status = '草稿'; break;
                }
                return status;
            }
        }
    }
</script>

<style lang="less" scoped>
    .posts-container {
        .title {
            span {
                font-size: 24px;
                font-weight: 400;
            }
        }
       .topNav {
           margin-top: 20px;
           display: flex;
           justify-content: space-between;
           margin-bottom: 20px;
       }
        .postsList {
            background-color: #fff;
        }
    }
</style>