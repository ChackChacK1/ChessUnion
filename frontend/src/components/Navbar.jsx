import { useState, useEffect } from 'react';
import {
    Menu, Button, Space, Modal, Form, Input, message,
    Drawer, Grid
} from 'antd';
import {
    HomeOutlined, TrophyOutlined, UserOutlined,
    LockOutlined, MenuOutlined, LoginOutlined,
    LogoutOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

const { useBreakpoint } = Grid;
const { confirm } = Modal;

const Navbar = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const navigate = useNavigate();
    const screens = useBreakpoint();

    // Определяем, является ли устройство мобильным
    const isMobile = !screens.md;

    const showAuthModal = () => {
        setIsAuthModalOpen(true);
        setMobileMenuOpen(false);
    };

    const handleAuthCancel = () => setIsAuthModalOpen(false);

    const onLogin = async (values) => {
        try {
            setLoginLoading(true);
            const response = await client.post('/api/auth/login', values);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role || 'USER');

            message.success('Успешный вход!');
            setIsAuthModalOpen(false);
            window.location.reload();
        } catch (error) {
            message.error('Ошибка входа: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegisterClick = () => {
        setIsAuthModalOpen(false);
        navigate('/registration');
        setMobileMenuOpen(false);
    };

    const showLogoutConfirm = () => {
        setLogoutConfirmOpen(true);
        setMobileMenuOpen(false); // Закрываем меню при открытии подтверждения выхода
    };

    const handleLogoutCancel = () => {
        setLogoutConfirmOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setLogoutConfirmOpen(false);
        navigate('/');
        window.location.reload();
    };

    const isAuthenticated = !!localStorage.getItem('token');
    const isAdmin = localStorage.getItem('role') === 'ADMIN';

    // Основные пункты меню
    const mainMenuItems = [
        {
            key: 'home',
            label: <Link to="/" onClick={() => setMobileMenuOpen(false)}>ChessUnion</Link>,
            icon: <HomeOutlined />,
        },
        {
            key: 'tournaments',
            label: <Link to="/tournaments" onClick={() => setMobileMenuOpen(false)}>Турниры</Link>,
            icon: <TrophyOutlined />,
        },
        {
            key: 'profile',
            label: <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Профиль</Link>,
            icon: <UserOutlined />,
            disabled: !isAuthenticated,
        },
        ...(isAdmin ? [{
            key: 'admin',
            label: <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Администрирование</Link>,
            icon: <LockOutlined />,
        }] : [])
    ];

    // Пункт меню для выхода (только для авторизованных)
    const logoutMenuItem = isAuthenticated ? [{
        key: 'logout',
        label: (
            <span onClick={showLogoutConfirm} style={{ color: '#ff4d4f', cursor: 'pointer' }}>
                Выйти
            </span>
        ),
        icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
    }] : [];

    // Полный список пунктов меню для мобильной версии
    const mobileMenuItems = [...mainMenuItems, ...logoutMenuItem];

    // Десктопная версия навбара
    const desktopNavbar = (
        <>
            <Menu
                mode="horizontal"
                items={mainMenuItems}
                style={{ justifyContent: 'center', flex: 1 }}
            />
            <Space style={{ position: 'absolute', right: 20, top: 10 }}>
                {isAuthenticated ? (
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={showLogoutConfirm}
                    >
                        Выйти
                    </Button>
                ) : (
                    <Button
                        type="text"
                        icon={<LoginOutlined />}
                        onClick={showAuthModal}
                    >
                        Войти
                    </Button>
                )}
            </Space>
        </>
    );

    // Мобильная версия навбара
    const mobileNavbar = (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 16px',
                height: '64px'
            }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>ChessUnion</span>
                </Link>

                <Space>
                    {/* Убираем кнопку выхода из верхней панели на мобильных */}
                    {!isAuthenticated && (
                        <Button
                            type="text"
                            icon={<LoginOutlined />}
                            onClick={showAuthModal}
                            size="small"
                        />
                    )}
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileMenuOpen(true)}
                    />
                </Space>
            </div>

            <Drawer
                title="Меню"
                placement="right"
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
                bodyStyle={{ padding: 0 }}
            >
                <Menu
                    mode="vertical"
                    items={mobileMenuItems}
                    style={{ border: 'none' }}
                />
            </Drawer>
        </>
    );

    return (
        <>
            {isMobile ? mobileNavbar : desktopNavbar}

            {/* Модальное окно авторизации */}
            <Modal
                title="Авторизация"
                open={isAuthModalOpen}
                onCancel={handleAuthCancel}
                footer={null}
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

            {/* Модальное окно подтверждения выхода */}
            <Modal
                title="Подтверждение выхода"
                open={logoutConfirmOpen}
                onOk={handleLogout}
                onCancel={handleLogoutCancel}
                okText="Да, выйти"
                cancelText="Отмена"
                okType="danger"
                closable={false}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '24px', marginRight: '12px' }} />
                    <span>Вы точно хотите выйти?</span>
                </div>
            </Modal>
        </>
    );
};

export default Navbar;