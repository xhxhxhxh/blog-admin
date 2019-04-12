<template>
    <div class="addPost-container">
        <!--<a-alert :message="warnMessage" banner closable class="alert" v-show="warn"/>-->
        <div class="loading" v-show="isLoading">
            <a-spin tip="正在提交，请稍后...">
                <div class="spin-content">
                </div>
            </a-spin>
        </div>
        <div class="titleBar">
            <span>添加文章</span>
        </div>
        <form action="/addPost" method="post" ref="myForm">
            <div class="left">
                <label for="title">标题：</label>
                <a-input placeholder="title" id="title" name="title"/>
                <label for="content">主要内容：</label>
                <a-textarea id="content" name="content" placeholder="content" :autosize="{ minRows: 20, maxRows: 20 }"></a-textarea>
            </div>
            <div class="right">
                <label for="category">所属分类：</label>
                <a-select
                        defaultValue="项目"
                        style="width: 100%; margin-top: 5px; margin-bottom: 20px;"
                        id="category" name="category" v-model="categoryValue"
                >
                    <a-select-option v-for="item in categories" :key="item.id">
                        {{item.name}}
                    </a-select-option>
                </a-select>

                <label for="status">状态：</label>
                <a-select
                        defaultValue="已发布"
                        style="width: 100%; margin-top: 5px; margin-bottom: 20px;"
                        id="status" name="status" v-model="statusValue"
                >
                    <a-select-option v-for="item in status" :key="item.slug">
                        {{item.name}}
                    </a-select-option>
                </a-select>
                <label for="tags">标签：</label>
                <a-select
                        mode="multiple"
                        placeholder="Please select"
                        :defaultValue="[]"
                        style="width: 100%; margin-top: 5px; margin-bottom: 20px;"
                        :maxTagCount="3"
                        @change="filterFags"
                        id="tags" name="tags"
                        v-model="selectedTags"
                >
                    <a-select-option v-for="item in tags" :key="item.id">
                        {{item.tag}}
                    </a-select-option>
                </a-select>
                <div class="tagsWarn">请至少选择1个标签，最多不能超过3个</div>
                <div class="operate">
                    <a-button size="small" @click="save" type="primary" :loading="isLoading">保存</a-button>
                    <a-button size="small" @click="cancel">取消</a-button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    import moment from 'moment';

    const status = [
        {name: '已发布', slug:'published'},
        {name: '草稿', slug:'draft'},
        {name: '回收站', slug:'trash'}
    ];

    export default {
        name: "AddPost",
        data() {
            return {
                selectedTags: [],
                status,
                statusValue: 'published',
                categories: [],
                categoryValue: 5,
                rootUrl: this.$store.state.rootUrl,
                tags: [],
                isLoading: false,
                error: ''
            }
        },
        created () {
            this.getCategories();
            this.getTags();
        },
        methods: {
            //限制标签个数
            filterFags (inputValue, option) {
                if (inputValue.length > 3) {
                    inputValue.pop();
                }
                this.selectedTags = inputValue;
            },

            //保存
            save (){
                //表单校验
                let myForm = this.$refs.myForm;
                let title = myForm.elements['title'].value.trim();
                let content = myForm.elements['content'].value.trim();
                let category = this.categoryValue;
                let status = this.statusValue.trim();
                let tags = this.selectedTags;

                if (title == '') {
                    return this.$message.warning('请输入标题');
                }
                if (category == '') {
                    return this.$message.warning('请选择所属项目');
                }
                if (status == '') {
                    return this.$message.warning('请选择状态');
                }
                if (tags.length < 1 || tags.length > 3) {
                    return this.$message.warning('请至少选择1个标签，最多不能超过3个');
                }
                let date = new Date();

                let params = {
                    title,
                    content,
                    category,
                    status,
                    tags,
                    date: moment(date).format('YYYY-MM-DD HH:mm:ss')
                };
                this.isLoading = true;
                this.warn = false;
                this.$axios.post(this.rootUrl + '/addPost',params)
                    .then(results => {
                        this.isLoading = false;
                        let data = results.data;
                        if (data.err_code == 200) {
                            this.$success({
                                title: '文章添加成功!',
                                onOk: () => {
                                    this.$router.go(-1);
                                },
                            })
                        }else if (data.err_code == 100) {
                            this.$message.warning('服务器正忙，请稍后再试！');
                        }else {
                            this.$message.warning(data.message);
                        }

                    })
                    .catch(err => {

                    })

            },

            //取消保存
            cancel (){
                this.$confirm({
                    title: '有内容没有保存，确定退出吗？',
                    content: '退出编辑后，更新的内容不会自动保存',
                    onOk:() =>{
                        this.$router.go(-1);
                    },
                    onCancel() {},
                });
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
                            this.tags = data.message;
                        } else{
                            this.error = data.message;
                        }
                    })
                    .catch(err => {

                    })
            },
        }
    }
</script>

<style lang="less" scoped>
    .addPost-container {
        .titleBar {
            margin-bottom: 10px;
            span {
                font-size: 24px;
                font-weight: 400;
            }
        }
        .alert {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translate(-50%,0);
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            z-index: 999;
            .spin-content{
                padding: 30px;
                width: 150px;
            }
        }
        form {
            display: flex;
            .left {
                flex: 3;
                input {
                    margin-top: 5px;
                    margin-bottom: 20px;
                }
                textarea {
                    margin-top: 5px;
                }
            }
            .right {
                flex: 1;
                padding-left: 24px;
                .tagsWarn {
                    color: rgba(0, 0, 0, 0.45);
                    font-size: 12px;
                    margin-left: 2px;
                    margin-top: -14px;
                }
                .operate {
                    display: flex;
                    justify-content: center;
                    margin-top: 60px;
                    button {
                        margin-right: 20px;
                    }
                }
            }
        }
    }
</style>