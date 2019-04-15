<template>
    <div class="resetPassword-container" style="width: 80%">
        <a-form :form="form" @submit="handleSubmit">
            <a-form-item v-bind="formItemLayout" label="旧密码">
                <a-input v-decorator="[
                                      'oldPassword',
                                      {
                                        rules: [
                                        {
                                          required: true, message: '请输入旧密码!',
                                        }],
                                      },
                                    ]"
                         type="password"
                />
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="新密码">
                <a-input v-decorator="[
                                      'newPassword',
                                      {
                                        rules: [
                                        {
                                          required: true, message: '请输入新密码!',
                                        },{
                                          validator: validateToNextPassword,
                                        },
                                        ],
                                      },
                                    ]"
                         type="password"
                />
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="确认密码">
                <a-input v-decorator="[
                                      'confirmPassword',
                                      {
                                        rules: [
                                        {
                                          required: true, message: '请再一次输入密码!',
                                        },{
                                          validator: compareToFirstPassword,
                                        },
                                        ],
                                      },
                ]"
                         @blur="confirmDirty = true"
                         type="password"
                />
            </a-form-item>
            <a-form-item v-bind="tailFormItemLayout">
                <a-button type="primary" html-type="submit" :loading="loading">
                    修改密码
                </a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script>
    import md5 from 'blueimp-md5';

    export default {
        name: "ResetPassword",
        data () {
            return {
                rootUrl: this.$store.state.rootUrl,
                confirmDirty: false,
                loading: false,
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
        methods: {
            //表单校验
            handleSubmit  (e) {
                e.preventDefault();
                this.form.validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        const params = {
                            oldPassword: md5(values.oldPassword),
                            newPassword: md5(values.newPassword),
                            confirmPassword: md5(values.confirmPassword),
                        };
                        this.loading = true;
                        this.$axios.post(this.rootUrl + '/resetPassword', params)
                            .then(results => {
                                let data = results.data;
                                this.loading = false;
                                if (data.err_code == 200) {
                                    this.$message.success('重置密码成功！');
                                }else if (data.err_code == 100) {
                                    this.$message.warning('服务器正忙，请稍后再试！');
                                }else {
                                    this.$message.warning(data.message);
                                }

                            })
                            .catch(err => {
                                this.loading = false;
                            })
                    }
                });
            },

            //确认密码校验
            validateToNextPassword  (rule, value, callback) {
                const form = this.form;
                const reg = /^[\S]{6,20}$/;
                if (!reg.test(value)) {
                    callback('密码长度在6-20个字符之间，且不能含有空格!');
                }else if (this.confirmDirty) {
                    form.validateFields(['confirmPassword'],{ force: true },function (err,value) {

                    });
                    this.confirmDirty = false;
                }
                callback();
            },
            compareToFirstPassword  (rule, value, callback) {
                const form = this.form;
                if (value && value !== form.getFieldValue('newPassword')) {
                    callback('两次输入的密码不一致!');
                } else {
                    callback();
                }
            },
        }
    }
</script>

<style scoped>

</style>