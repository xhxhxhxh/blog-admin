<template>
    <div class="user-container">
        <a-form :form="form" @submit="handleSubmit">
            <a-form-item v-bind="formItemLayout" label="头像">
                <a-upload
                        name="avatar"
                        listType="picture-card"
                        class="avatar-uploader"
                        :showUploadList="false"
                        :action="$store.state.rootUrl + '/uploadAvatar'"
                        :beforeUpload="beforeUpload"
                        @change="handleChange"
                        accept="image/*"
                >
                    <img v-if="imageUrl" :src="rootUrl + imageUrl" alt="avatar" width="86.4" height="86.4" style="object-fit: cover"/>
                    <div v-else>
                        <a-icon :type="loading ? 'loading' : 'plus'" />
                        <div class="ant-upload-text">Upload</div>
                    </div>
                </a-upload>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="" style="display: none">
                <a-input type="hidden" v-decorator="['avatar',{initialValue: imageUrl}]" name="avatar" />
            </a-form-item>

            <a-form-item v-bind="formItemLayout" label="邮箱">
                <a-input disabled :value="email"/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="别名">
                <a-input v-decorator="[
                                      'slug',
                                      {
                                        rules: [{
                                          pattern: /^[\S]{1,20}$/, message: '别名不能超过20个字符',
                                        },
                                        {
                                          required: true, message: '请输入别名!',
                                        }],
                                        initialValue: slug
                                      }
                                    ]"

                />
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="昵称">
                <a-input v-decorator="[
                                      'nickname',
                                      {
                                        rules: [{
                                          pattern: /^[\S]{1,20}$/, message: '昵称不能超过20个字符',
                                        },
                                        {
                                          required: true, message: '请输入昵称!',
                                        }],
                                        initialValue: nickname
                                      }
                                    ]"

                />
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="简介">
                <a-textarea :autosize="{ minRows: 5, maxRows: 5 }" v-decorator="[
                                      'bio',
                                      {
                                        rules: [{
                                          max: 200, message: '简介不能超过200字符!',
                                        }, ],
                                        initialValue: bio
                                      }
                                    ]">

                </a-textarea>
            </a-form-item>
            <a-form-item v-bind="tailFormItemLayout">
                <a-button type="primary" html-type="submit" :loading="isloading">
                    更新
                </a-button>
                <a-button style="margin-left: 10px" @click="$router.push('/resetPassword')">
                    修改密码
                </a-button>
            </a-form-item>
        </a-form>

    </div>
</template>

<script>

    // function getBase64 (img, callback) {
    //     const reader = new FileReader()
    //     reader.addEventListener('load', () => callback(reader.result))
    //     reader.readAsDataURL(img)
    // }

    export default {
        name: "User",
        data () {
            return {
                loading: false,
                isloading: false,
                email: '',
                slug: '',
                nickname: '',
                bio: '',
                imageUrl: '',
                rootUrl: this.$store.state.rootUrl,
                formItemLayout: {
                    labelCol: {
                        xs: { span: 24 },
                        sm: { span: 8 },
                    },
                    wrapperCol: {
                        xs: { span: 24 },
                        sm: { span: 16 },
                    },
                },
                tailFormItemLayout: {
                    wrapperCol: {
                        xs: {
                            span: 24,
                            offset: 0,
                        },
                        sm: {
                            span: 16,
                            offset: 8,
                        },
                    },
                },
            }
        },
        beforeCreate() {
            this.form = this.$form.createForm(this);
        },
        created () {
            this.getUserData()
        },
        methods: {
            //获取个人信息
            getUserData () {
                this.$axios.post(this.rootUrl + '/getUserData')
                    .then(results => {
                        let data = results.data;
                        // console.log(data.message);
                        if (data.err_code == 200) {
                            const user = data.message;
                            this.email = user.email;
                            this.slug = user.slug;
                            this.nickname = user.nickname;
                            this.imageUrl = user.avatar;
                            this.bio = user.bio;
                        }else if (data.err_code == 100) {
                            this.$message.warning('服务器正忙，请稍后再试！');
                        }else {
                            this.$message.warning(data.message);
                        }

                    })
                    .catch(err => {

                    })
            },

            //表单校验
            handleSubmit  (e) {
                e.preventDefault();
                this.form.validateFieldsAndScroll((err, values) => {
                    if (err) {
                        // console.log(err);
                    }
                    if (!err) {
                        // console.log('Received values of form: ', values);
                        this.isloading = true;
                        this.$axios.post(this.rootUrl + '/updateUser', values)
                            .then(results => {
                                let data = results.data;
                                this.isloading = false;
                                // console.log(data.message);
                                if (data.err_code == 200) {
                                    this.$message.success('更新成功！');
                                    this.$emit('getAvatar');
                                }else if (data.err_code == 100) {
                                    this.$message.warning('服务器正忙，请稍后再试！');
                                }else {
                                    this.$message.warning(data.message);
                                }

                            })
                            .catch(err => {

                            })
                    }
                });
            },

            //文件上传验证
            handleChange (info) {
                if (info.file.status === 'uploading') {
                    this.loading = true;
                    return
                }
                if (info.file.status === 'done') {
                    // console.log(info.file);
                    const result = info.file.response;
                    // Get this url from response in real world.
                    // getBase64(info.file.originFileObj, (imageUrl) => {
                    //     this.imageUrl = imageUrl
                    //     this.loading = false
                    // })
                    if (result.err_code == 200) {
                        this.imageUrl = '/' + result.message.replace('\\', '/');
                    } else {
                        this.$message.error(result.message);
                    }
                    this.loading = false;

                }
            },
            beforeUpload (file) {
                const isImg = /^[image/]/;
                const isJPG = isImg.test(file.type)
                if (!isJPG) {
                    this.$message.error('您上传的图片格式不正确!')
                }
                const isLt1M = file.size / 1024 / 1024 < 1;
                if (!isLt1M) {
                    this.$message.error('图片大小不能超过1MB!')
                }
                return isJPG && isLt1M
            },
        }
    }
</script>

<style lang="less" scoped>
    .user-container {
        width: 80%;
    }

</style>