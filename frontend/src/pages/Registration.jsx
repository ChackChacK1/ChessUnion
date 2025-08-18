import { Button, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

const Registration = () => {
    const navigate = useNavigate();

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
            <Form onFinish={onFinish}>
                <Form.Item name="username" label="Логин" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item name="firstName" label="Имя">
                    <Input />
                </Form.Item>
                <Form.Item name="lastName" label="Фамилия">
                    <Input />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Зарегистрироваться</Button>
                </Form.Item>
            </Form>
            <Link to="/login">Уже есть аккаунт? Войдите</Link>
        </div>
    );
};

export default Registration;