import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import client from '../api/client';

const { Title } = Typography;

const ChangePassword = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Пароли не совпадают!');
            return;
        }

        setLoading(true);
        try {
            await client.patch('/api/user/changePassword', {
                newPassword: values.newPassword
            });
            message.success('Пароль успешно изменён!');
            form.resetFields();
            navigate('/profile'); // Возвращаемся в профиль после успеха
        } catch (error) {
            message.error('Ошибка при смене пароля: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <Card
                title={
                    <div style={{ textAlign: 'center', color: 'var(--text-color)' }}>
                        <LockOutlined style={{ marginRight: 8 }} />
                        Смена пароля
                    </div>
                }
                bordered={false}
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
            >
                <Form
                    form={form}
                    name="changePassword"
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="newPassword"
                        label="Новый пароль"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите новый пароль!' },
                            { min: 6, message: 'Пароль должен быть не менее 6 символов!' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            placeholder="Введите новый пароль"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Подтверждение пароля"
                        dependencies={['newPassword']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Пожалуйста, подтвердите пароль!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Пароли не совпадают!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="Повторите новый пароль"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            style={{ width: '100%' }}
                        >
                            Сменить пароль
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ChangePassword;