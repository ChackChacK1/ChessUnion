import { Button, Form, Input, message, Card, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

const { Title } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            const response = await client.post('/api/auth/login', values);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role || 'USER');
            message.success('Успешный вход!');
            navigate('/');
        } catch (error) {
            message.error('Ошибка входа: ' + error.response?.data?.message || error.message);
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
                    Вход
                </Title>

                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="login"
                        label={<span style={{ color: 'var(--text-color)' }}>Логин или Email</span>}
                        rules={[{ required: true, message: 'Введите логин или email' }]}
                    >
                        <Input
                            placeholder="Введите логин или email"
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
                            placeholder="Введите пароль"
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
                            Войти
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Link
                        to="/registration"
                        style={{
                            color: 'var(--primary-color)',
                            textDecoration: 'none'
                        }}
                    >
                        Нет аккаунта? Зарегистрируйтесь
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;