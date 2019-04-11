<template>
    <div class="category-container">
        <div class="title">
            <span>分类目录</span>&nbsp;
        </div>
        <div class="categoryList">
            <a-button type="primary" @click="addCategory" class="add">添加</a-button>
            <a-table :columns="columns" :dataSource="categories" bordered rowKey="id" size="small" :pagination="false" :scroll="{ y: 400 }">
                <template v-for="col in ['name', 'slug']" :slot="col" slot-scope="text, record, index">
                    <div :key="col">
                        <a-input
                                v-if="isEdit == record.id "
                                style="margin: -5px 0"
                                :value="text"
                                @change="e => handleChange(e.target.value, record.id, col)"
                        />
                        <template v-else>{{text}}</template>
                    </div>
                </template>
                <template slot="operate" slot-scope="text, record, index">
                    <div class='editable-row-operations'>
                        <div v-if="isEdit == record.id" :style="{display: 'flex', justifyContent: 'space-evenly'}">
                            <a-button size="small" type="primary" @click="() => save(record.id)">保存</a-button>
                            <a-popconfirm title='确定取消?' @confirm="() => cancel(record.id)" v-model="visible">
                                <a-button size="small">取消</a-button>
                            </a-popconfirm>
                        </div>
                        <div v-else :style="{display: 'flex', justifyContent: 'space-evenly'}">
                            <a-button size="small" @click="() => edit(record.id)">编辑</a-button>
                            <a-button size="small" type="danger" @click="deleteCategory(record.id)">删除</a-button>
                        </div>
                    </div>
                </template>
            </a-table>
        </div>

    </div>
</template>

<script>

    const columns = [{
        title: '名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' },
        width: '35%'
    }, {
        title: 'slug',
        dataIndex: 'slug',
        scopedSlots: { customRender: 'slug' },
        width: '35%',
    }, {
        title: '操作',
        dataIndex: 'operate',
        scopedSlots: { customRender: 'operate' },
        width: '30%',
        align: 'center'
    }];



    export default {
        name: "Category",
        data() {
            return {
                categories: [],
                cacheCategories: [],
                columns,
                loading: false,
                pagination: false,
                rootUrl: 'http://localhost:3000',
                error: null,
                isEdit: 0,
                isAdding: false,
                visible: false
            }
        },
        created () {
            this.getCategories();
        },
        methods: {
            handleChange (value, key, column) {
                // console.log(value, key, column)
                const newData = [...this.categories];
                const target = newData.filter(item => key === item.id)[0];
                if (target) {
                    target[column] = value;
                    this.categories = newData
                }
            },
            edit (id) {
                if (this.isAdding) {
                    return this.visible = true;
                }
                this.isEdit = id
            },
            save (key) {
                const newData = [...this.categories];
                const target = newData.filter(item => key === item.id)[0];
                const slugArr = newData.map(item => {
                    if (item.id != key) {
                        return item.slug;
                    }
                });

                if (target.name.trim() == '') {
                    return this.$message.warning('请输入名称！');
                }
                if (target.slug.trim() == '') {
                    return this.$message.warning('请输入slug！');
                }
                if (slugArr.includes(target.slug)) {
                    return this.$message.warning('不能有相同slug');
                }

                if (target) {
                    let url = '/updateCategory';
                    if (this.isAdding) {
                        url = '/addCategory';
                    }
                    this.$axios.post(this.rootUrl + url,target)
                        .then(results => {
                            let data = results.data;
                            if (data.err_code == 200) {
                                this.isAdding = false;
                                this.categories = newData;
                                this.cacheCategories = newData.map(item => ({ ...item }));
                                this.isEdit = 0;
                                this.$message.success('分类目录更新成功!');
                            }else if (data.err_code == 100) {
                                this.$message.warning('分类目录更新失败!');
                            }else {
                                this.$message.warning(data.message);
                            }

                        })
                        .catch(err => {

                        });
                }
            },
            cancel (key) {
                const newData = [...this.categories];
                const target = newData.filter(item => key === item.id)[0];
                if (target) {
                    Object.assign(target, this.cacheCategories.filter(item => key === item.id)[0]);
                    this.categories = newData;
                    this.isEdit = 0;
                }
                if (this.isAdding) {
                    this.isAdding = false;
                    this.categories.pop();
                }
            },

            //添加分类
            addCategory () {
                if (!this.isAdding) {
                    const lastId = this.categories[this.categories.length - 1].id;
                    const newCategory = {id: lastId + 1, name: '', slug: ''};
                    this.categories.push(newCategory);
                    this.isEdit = lastId + 1;
                    this.isAdding = true;
                }
            },

            //删除
            deleteCategory (id) {
                this.$confirm({
                    title: `你确定要删除这项分类吗？`,
                    content: '删除后将不可恢复',
                    okText: '是的',
                    okType: 'danger',
                    cancelText: '否',
                    onOk: () => {
                        this.$axios.get(this.rootUrl + '/deleteCategory?id=' + id)
                            .then(results => {
                                // console.log(results.data);
                                let data = results.data;
                                if (data['err_code'] == 200) {
                                    this.$message.success('删除成功',5);
                                    let newData = [...this.categories];
                                    newData = newData.filter(item => id != item.id);
                                    this.categories = newData;
                                    this.cacheCategories = newData.map(item => ({ ...item }));
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

            //编辑和删除
            editAndDelete (e) {
                let title = e.target.dataset.title;
                let id = e.target.dataset.id;
                if (title == 'edit') {
                    this.$router.push('/post/edit/' + id);
                } else if (title == 'check') {
                    this.$router.push('/post/detail/' + id);
                } else if (title == 'delete') {
                   this.delete(id);
                }
            },

            //获取分类目录
            getCategories () {
                this.$axios.get(this.rootUrl + '/getCategories')
                    .then(results => {
                        let data = results.data;
                        if (data['err_code'] == 200) {
                            this.categories = data.message;
                            this.cacheCategories = this.categories.map(item => ({ ...item }));
                        } else{
                            this.error = data.message;
                        }
                    })
                    .catch(err => {

                    })
            },


        },
    }
</script>

<style lang="less" scoped>
    .category-container {
        .title {
            span {
                font-size: 24px;
                font-weight: 400;
            }
        }
        .categoryList {
            background-color: #fff;
            width: 700px;
            margin: 20px auto 0;
            .add {
                margin-bottom: 5px;
            }
        }
    }
</style>