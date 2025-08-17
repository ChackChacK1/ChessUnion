import { Button, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

const LoginPage = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const response = await client.post('/api/auth/login', values);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role || 'USER'); // Если backend не присылает роль, по умолчанию 'USER'
            message.success('Успешный вход!');
            navigate('/');
        } catch (error) {
            message.error('Ошибка входа: ' + error.response?.data?.message || error.message);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}>
            <Form onFinish={onFinish}>
                <Form.Item name="login" label="Логин" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Войти</Button>
                </Form.Item>
            </Form>
            <Link to="/registration">Нет аккаунта? Зарегистрируйтесь</Link>
        </div>
    );
};

export default LoginPage;