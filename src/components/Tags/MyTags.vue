<template>
    <div class="myTags-container">
        <div class="title">
            <span>我的标签</span>&nbsp;
        </div>
        <div class="tagsList">
            <a-button type="primary" @click="addCategory" class="add">添加</a-button>
            <a-table :columns="columns" :dataSource="tags" bordered rowKey="id" size="small" :pagination="false"
                     :scroll="{ y: 400 }" ref="tagsTable">
                <template slot="tag" slot-scope="text, record, index">
                    <div key="tag">
                        <a-input
                                v-if="isEdit == record.id "
                                style="margin: -5px 0"
                                :value="text"
                                @change="e => handleChange(e.target.value, record.id, 'tag')"
                        />
                        <template v-else>{{text}}</template>
                    </div>
                </template>
                <template slot="color" slot-scope="text, record, index">
                    <div key="color" class="color">
                        <a-input type="color" class="selectTagColor" v-if="isEdit == record.id"
                                 @change="e => handleChange(e.target.value, record.id, 'color')"/>
                        <span :style="{backgroundColor: text || 'orange' }" class="tagColor"></span>
                        <div  v-if="isEdit == record.id ">
                            <a-input
                                    style="margin: -5px 0"
                                    :value="text"
                                    @change="e => handleChange(e.target.value, record.id, 'color')"
                            />
                        </div>
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
        title: '标签',
        dataIndex: 'tag',
        scopedSlots: { customRender: 'tag' },
        width: '35%'
    }, {
        title: '颜色',
        dataIndex: 'color',
        scopedSlots: { customRender: 'color' },
        width: '35%',
    }, {
        title: '操作',
        dataIndex: 'operate',
        scopedSlots: { customRender: 'operate' },
        width: '30%',
        align: 'center'
    }];



    export default {
        name: "myTags",
        data() {
            return {
                tags: [],
                cacheTags: [],
                columns,
                loading: false,
                pagination: false,
                rootUrl: this.$store.state.rootUrl,
                error: null,
                isEdit: 0,
                isAdding: false,
                visible: false
            }
        },
        created () {
            this.getTags();
        },
        updated () {
            //滑动到页面底部
            if (this.isAdding) {
                const tagsTable = this.$refs.tagsTable;
                const height = tagsTable.$el.offsetHeight;
                document.querySelector('.ant-table-body').scrollTop = height;
            }
        },
        methods: {
            handleChange (value, key, column) {
                // console.log(value, key, column)
                const newData = [...this.tags];
                const target = newData.filter(item => key === item.id)[0];
                if (target) {
                    if (column == 'color') {
                        target[column] = value.toLocaleLowerCase();
                    } else {
                        target[column] = value;
                    }
                    this.tags = newData
                }
            },
            edit (id) {
                if (this.isAdding) {
                    return this.visible = true;
                }
                this.isEdit = id
            },
            save (key) {
                const isColor = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$|^[a-zA-Z]{1,25}$/;
                const newData = [...this.tags];
                const target = newData.filter(item => key === item.id)[0];
                const tagArr = newData.map(item => {
                    if (item.id != key) {
                        return item.tag;
                    }
                });
                if (!isColor.test(target.color.trim())) {
                    return this.$message.warning('您输入的颜色不合法!');
                }
                if (target.tag.trim() == '') {
                    return this.$message.warning('请输入标签名！');
                }
                if (tagArr.includes(target.tag)) {
                    return this.$message.warning('不能有相同标签名');
                }

                if (target) {
                    let url = '/updateTag';
                    if (this.isAdding) {
                        url = '/addTag';
                    }
                    this.$axios.post(this.rootUrl + url,target)
                        .then(results => {
                            let data = results.data;
                            if (data.err_code == 200) {
                                this.isAdding = false;
                                this.tags = newData;
                                this.cacheTags = newData.map(item => ({ ...item }));
                                this.isEdit = 0;
                                this.$message.success('标签更新成功!');
                            }else if (data.err_code == 100) {
                                this.$message.warning('标签更新失败!');
                            }else {
                                this.$message.warning(data.message);
                            }

                        })
                        .catch(err => {

                        });
                }
            },
            cancel (key) {
                const newData = [...this.tags];
                const target = newData.filter(item => key === item.id)[0];
                if (target) {
                    Object.assign(target, this.cacheTags.filter(item => key === item.id)[0]);
                    this.tags = newData;
                    this.isEdit = 0;
                }
                if (this.isAdding) {
                    this.isAdding = false;
                    this.tags.pop();
                }
            },
            //添加分类
            addCategory () {
                if (!this.isAdding) {
                    const lastId = this.tags[this.tags.length - 1].id;
                    const newTag = {id: lastId + 1, tag: '', color: ''};
                    this.tags.push(newTag);
                    this.isEdit = lastId + 1;
                    this.isAdding = true;
                }
            },

            //删除
            deleteCategory (id) {
                this.$confirm({
                    title: `你确定要删除这个标签吗？`,
                    content: '删除后将不可恢复',
                    okText: '是的',
                    okType: 'danger',
                    cancelText: '否',
                    onOk: () => {
                        this.$axios.get(this.rootUrl + '/deleteTag?id=' + id)
                            .then(results => {
                                // console.log(results.data);
                                let data = results.data;
                                if (data['err_code'] == 200) {
                                    this.$message.success('删除成功',5);
                                    let newData = [...this.tags];
                                    newData = newData.filter(item => id != item.id);
                                    this.tags = newData;
                                    this.cacheTags = newData.map(item => ({ ...item }));
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


            //获取分类目录
            getTags () {
                this.$axios.get(this.rootUrl + '/getTags')
                    .then(results => {
                        let data = results.data;
                        if (data['err_code'] == 200) {
                            this.tags = data.message;
                            this.cacheTags = this.tags.map(item => ({ ...item }));
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
    .myTags-container {
        .title {
            span {
                font-size: 24px;
                font-weight: 400;
            }
        }
        .tagsList {
            background-color: #fff;
            width: 700px;
            margin: 20px auto 0;
            .add {
                margin-bottom: 5px;
            }
            .color {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                position: relative;
                .tagColor {
                    width: 15px;
                    height: 15px;
                    display: block;
                    margin-right: 10px;
                }
                .selectTagColor {
                    width: 16px;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    top: 0;
                    margin-right: 10px;
                    border: none;
                    opacity: 0;
                }
            }
        }
    }
</style>