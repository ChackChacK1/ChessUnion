import { Menu, Button, Space, Modal, Form, Input, message } from 'antd';
import { HomeOutlined, TrophyOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import client from '../api/client';

const Navbar = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const navigate = useNavigate();

    const showAuthModal = () => setIsAuthModalOpen(true);
    const handleAuthCancel = () => setIsAuthModalOpen(false);

    const onLogin = async (values) => {
        try {
            setLoginLoading(true);
            const response = await client.post('/api/auth/login', values);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role || 'USER');

            message.success('Успешный вход!');
            setIsAuthModalOpen(false); // Закрываем модальное окно
            window.location.reload(); // Перезагружаем страницу для обновления состояния
        } catch (error) {
            message.error('Ошибка входа: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegisterClick = () => {
        setIsAuthModalOpen(false); // Закрываем модальное окно
        navigate('/registration'); // Переходим на страницу регистрации
    };
    const isAuthenticated = !!localStorage.getItem('token');
    const isAdmin = localStorage.getItem('role') === 'ADMIN';

    const menuItems = [
        {
            key: 'home',
            label: <Link to="/">ChessUnion</Link>,
            icon: <HomeOutlined />,
        },
        {
            key: 'tournaments',
            label: <Link to="/tournaments">Турниры</Link>,
            icon: <TrophyOutlined />,
        },
        {
            key: 'profile',
            label: <Link to="/profile">Профиль</Link>,
            icon: <UserOutlined />,
            disabled: !isAuthenticated,
        },
        ...(isAdmin ? [{
            key: 'admin',
            label: <Link to="/admin">Администрирование</Link>,
            icon: <LockOutlined />,
        }] : [])
    ];

    return (
        <>
            <Menu
                mode="horizontal"
                items={menuItems}
                style={{ justifyContent: 'center' }}
            />
            <Space style={{ position: 'absolute', right: 20, top: 10 }}>
                {localStorage.getItem('token') ? (
                    <Button
                        type="text"
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('role');
                            navigate('/');
                            window.location.reload();
                        }}
                    >
                        Выйти
                    </Button>
                ) : (
                    <Button type="text" onClick={showAuthModal}>
                        Войти
                    </Button>
                )}
            </Space>

            <Modal
                title="Авторизация"
                open={isAuthModalOpen}
                onCancel={handleAuthCancel}
                footer={null}
                style={{ top: 20, right: 20, position: 'absolute' }}
                bodyStyle={{ padding: '20px' }}
                width={400}
            >
                <Form onFinish={onLogin} layout="vertical">
                    <Form.Item
                        name="login"
                        label="Логин или Email"
                        rules={[{ required: true, message: 'Введите логин или email' }]}
                    >
                        <Input placeholder="Введите логин или email" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Пароль"
                        rules={[{ required: true, message: 'Введите пароль' }]}
                    >
                        <Input.Password placeholder="Введите пароль" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loginLoading}
                            style={{ width: '100%', marginBottom: '10px' }}
                        >
                            Войти
                        </Button>
                        <Button
                            type="link"
                            style={{ width: '100%', textAlign: 'center' }}
                            onClick={handleRegisterClick}
                        >
                            Нет аккаунта? Зарегистрироваться
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Navbar;