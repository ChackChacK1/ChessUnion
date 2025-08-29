import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const { Title } = Typography;

const EditProfile = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await client.get('/api/user/profile');
                setProfile(response.data);
                form.setFieldsValue({
                    username: response.data.username,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email || ''
                });
            } catch (error) {
                message.error('Ошибка загрузки профиля');
            }
        };

        fetchProfile();
    }, [form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await client.patch('/api/user/update', values);
            message.success('Профиль успешно обновлен');
            navigate('/profile');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            message.error('Ошибка обновления: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    if (!profile) {
        return <div>Загрузка...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <Card>
                <Space style={{ marginBottom: 20, alignItems: 'center' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleCancel}
                        type="text"
                    />
                    <Title level={4} style={{ margin: 0 }}>Редактирование профиля</Title>
                </Space>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Логин"
                        name="username"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите логин' },
                            { min: 3, message: 'Логин должен содержать минимум 3 символа' }
                        ]}
                    >
                        <Input placeholder="Введите логин" />
                    </Form.Item>

                    <Form.Item
                        label="Имя"
                        name="firstName"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите имя' }
                        ]}
                    >
                        <Input placeholder="Введите имя" />
                    </Form.Item>

                    <Form.Item
                        label="Фамилия"
                        name="lastName"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите фамилию' }
                        ]}
                    >
                        <Input placeholder="Введите фамилию" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { type: 'email', message: 'Введите корректный email' }
                        ]}
                    >
                        <Input placeholder="Введите email" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Сохранить
                            </Button>
                            <Button onClick={handleCancel}>
                                Отмена
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditProfile;