import { Menu, Button, Space, Dropdown, Modal, Form, Input } from 'antd';
import { HomeOutlined, TrophyOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const navigate = useNavigate();
    const role = localStorage.getItem('role'); // Получаем роль

    const isAdmin = role === 'ADMIN'; // Проверяем, админ ли

    const showAuthModal = () => setIsAuthModalOpen(true);
    const handleAuthCancel = () => setIsAuthModalOpen(false);

    const onLogin = (values) => {
        console.log('Вход:', values);
        // TODO: Добавить запрос к API
        setIsAuthModalOpen(false);
        navigate('/');
    };

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
            disabled: !localStorage.getItem('token'), // Только для авторизованных
        },
        {
            key: 'admin',
            label: <Link to="/admin">Администрирование</Link>,
            icon: <LockOutlined />,
            disabled: !isAdmin,
        },
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
            >
                <Form onFinish={onLogin}>
                    <Form.Item name="login" label="Логин" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
                <Link to="/registration">Нет аккаунта? Зарегистрируйтесь</Link>
            </Modal>
        </>
    );
};

export default Navbar;