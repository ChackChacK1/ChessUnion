import { Button, Form, Input, message, Card, Typography, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

const { Title } = Typography;

const Registration = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            await client.post('/api/auth/registration', values);
            message.success('Регистрация успешна! Теперь войдите.');
            navigate('/login');
        } catch (error) {
            message.error('Ошибка: ' + error.response?.data?.message || error.message);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}>
            <Card
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
            >
                <Title level={3} style={{ textAlign: 'center', color: 'var(--text-color)', marginBottom: 30 }}>
                    Регистрация
                </Title>

                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        label={<span style={{ color: 'var(--text-color)' }}>Логин</span>}
                        rules={[{ required: true, message: 'Введите логин' }]}
                    >
                        <Input
                            placeholder="Придумайте логин"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={<span style={{ color: 'var(--text-color)' }}>Пароль</span>}
                        rules={[{ required: true, message: 'Введите пароль' }]}
                    >
                        <Input.Password
                            placeholder="Придумайте пароль"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="firstName"
                        label={<span style={{ color: 'var(--text-color)' }}>Имя</span>}
                        rules={[{ required: true, message: 'Введите имя' }]}
                    >
                        <Input
                            placeholder="Ваше имя"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="lastName"
                        label={<span style={{ color: 'var(--text-color)' }}>Фамилия</span>}
                        rules={[{ required: true, message: 'Введите фамилию' }]}
                    >
                        <Input
                            placeholder="Ваша фамилия"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={<span style={{ color: 'var(--text-color)' }}>Email</span>}
                        rules={[{
                            type: 'email',
                            message: 'Введите корректный email'
                        }]}
                    >
                        <Input
                            placeholder="Ваш email"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{
                                width: '100%',
                                backgroundColor: 'var(--hover-color)',
                                borderColor: 'var(--hover-color)',
                                height: '40px'
                            }}
                        >
                            Зарегистрироваться
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Link
                        to="/login"
                        style={{
                            color: 'var(--primary-color)',
                            textDecoration: 'none'
                        }}
                    >
                        Уже есть аккаунт? Войдите
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Registration;