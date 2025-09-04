import { useState, useEffect } from 'react';
import {
    Menu, Button, Space, Modal, Form, Input, message,
    Drawer, Grid, Switch, Alert
} from 'antd';
import {
    HomeOutlined, TrophyOutlined, UserOutlined,
    LockOutlined, MenuOutlined, LoginOutlined,
    LogoutOutlined, ExclamationCircleOutlined,
    MoonOutlined, SunOutlined, StarOutlined
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
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [loginError, setLoginError] = useState(''); // Новое состояние для ошибки
    const navigate = useNavigate();
    const screens = useBreakpoint();

    // Инициализация темы при загрузке
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        setIsDarkTheme(theme === 'dark');
        document.documentElement.setAttribute('data-theme', theme);
    }, []);

    // Переключение темы
    const toggleTheme = (checked) => {
        setIsDarkTheme(checked);
        const theme = checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    // Определяем, является ли устройство мобильным
    const isMobile = !screens.md;

    const showAuthModal = () => {
        setIsAuthModalOpen(true);
        setMobileMenuOpen(false);
        setLoginError(''); // Сбрасываем ошибку при открытии модального окна
    };

    const handleAuthCancel = () => {
        setIsAuthModalOpen(false);
        setLoginError(''); // Сбрасываем ошибку при закрытии модального окна
    };

    const onLogin = async (values) => {
        try {
            setLoginLoading(true);
            setLoginError(''); // Сбрасываем ошибку перед отправкой запроса

            const response = await client.post('/api/auth/login', values);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role || 'USER');

            message.success('Успешный вход!');
            setIsAuthModalOpen(false);
            window.location.reload();
        } catch (error) {
            // Правильная обработка ошибки авторизации
            let errorMessage = 'Ошибка входа';

            if (error.response) {
                // Сервер вернул ошибку
                const errorData = error.response.data;

                // Проверяем разные форматы ошибок
                if (errorData.error === 'Bad credentials!') {
                    errorMessage = 'Неверный логин или пароль';
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.body) {
                    errorMessage = errorData.body;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
            } else if (error.request) {
                // Запрос был сделан, но ответ не получен
                errorMessage = 'Нет ответа от сервера. Проверьте соединение.';
            } else {
                // Что-то пошло не так при настройке запроса
                errorMessage = error.message || 'Неизвестная ошибка';
            }

            // Устанавливаем ошибку в состояние для отображения в форме
            setLoginError(errorMessage);
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
        setMobileMenuOpen(false);
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
            icon: <HomeOutlined style={{
                color: 'var(--text-color)'
            }} />,
        },
        {
            key: 'tournaments',
            label: <Link to="/tournaments" onClick={() => setMobileMenuOpen(false)}>Турниры</Link>,
            icon: <TrophyOutlined style={{
                color: 'var(--text-color)'
            }}/>,
        },
        {
            key: 'topList',
            label: <Link to="/top" onClick={() => setMobileMenuOpen(false)}>Топ</Link>,
            icon: <StarOutlined style={{
                color: 'var(--text-color)'
            }}/>,
        },
        ...(isAuthenticated ? [{
            key: 'profile',
            label: <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Профиль</Link>,
            icon: <UserOutlined style={{
                color: 'var(--text-color)'
            }}/>,
        }] : []),
        ...(isAdmin ? [{
            key: 'admin',
            label: <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Администрирование</Link>,
            icon: <LockOutlined style={{
                color: 'var(--text-color)'
            }}/>,
        }] : [])
    ];

    // Пункт меню для переключателя темы (для мобильной версии)
    const themeMenuItem = [{
        key: 'theme',
        label: (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-color)'}}>
                <span>Тёмная тема </span>
                <Switch
                    checked={isDarkTheme}
                    onChange={toggleTheme}
                    size="small"
                    checkedChildren={<MoonOutlined />}
                    unCheckedChildren={<SunOutlined />}
                />
            </div>
        ),
    }];

    // Пункт меню для выхода
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
    const mobileMenuItems = [...mainMenuItems, ...themeMenuItem, ...logoutMenuItem];

    // Десктопная версия навбара
    const desktopNavbar = (
        <>
            <Menu
                mode="horizontal"
                items={mainMenuItems}
                style={{ justifyContent: 'center', flex: 1 }}
            />
            <Space style={{ position: 'absolute', right: 20, top: 10 }}>
                {/* Переключатель темы */}
                <Switch
                    checked={isDarkTheme}
                    onChange={toggleTheme}
                    checkedChildren={<MoonOutlined />}
                    unCheckedChildren={<SunOutlined />}
                />

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
                height: '64px',
                backgroundColor: 'var(--navbar-background-color)'
            }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--text-color)' }}>ChessUnion</span>
                </Link>

                <Space>
                    {/* Переключатель темы в мобильной версии */}
                    <Switch
                        checked={isDarkTheme}
                        onChange={toggleTheme}
                        size="small"
                        checkedChildren={<MoonOutlined />}
                        unCheckedChildren={<SunOutlined />}
                    />

                    {!isAuthenticated && (
                        <Button
                            type="text"
                            icon={<LoginOutlined />}
                            onClick={showAuthModal}
                            size="small"
                            style={{
                                color: 'var(--text-color)',
                                backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--hover-color)';
                                e.currentTarget.style.color = 'var(--primary-color)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-color)';
                            }}
                        />
                    )}
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileMenuOpen(true)}
                        style={{
                            color: 'var(--text-color)',
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--hover-color)';
                            e.currentTarget.style.color = 'var(--primary-color)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-color)';
                        }}
                    />
                </Space>
            </div>

            <Drawer
                title="Меню"
                placement="right"
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
                styles={{
                    body: {
                        padding: 0,
                        backgroundColor: 'var(--navbar-background-color)'
                    },
                    header: {
                        backgroundColor: 'var(--navbar-background-color)',
                        color: 'var(--text-color)',
                        borderBottom: '1px solid var(--border-color)'
                    }
                }}
            >
                <Menu
                    mode="vertical"
                    items={mobileMenuItems}
                    style={{
                        border: 'none',
                        backgroundColor: 'var(--navbar-background-color)'
                    }}
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
                            styles={{
                                input: {
                                    backgroundColor: 'var(--card-bg)',
                                    color: 'var(--text-color)',
                                }
                            }}
                        />
                    </Form.Item>

                    {/* Отображение ошибки авторизации */}
                    {loginError && (
                        <Alert
                            message={loginError}
                            type="error"
                            showIcon
                            style={{
                                marginBottom: '16px',
                                backgroundColor: 'var(--error-bg)',
                                borderColor: 'var(--error-border)'
                            }}
                        />
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loginLoading}
                            style={{
                                width: '100%',
                                marginBottom: '10px',
                                backgroundColor: 'var(--hover-color)',
                                borderColor: 'var(--hover-color)'
                            }}
                        >
                            Войти
                        </Button>
                        <Button
                            type="link"
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                color: 'var(--primary-color)'
                            }}
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
                style={{
                    color: 'var(--text-color)'
                }}
                styles={{
                    content: {
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)'
                    },
                    header: {
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        borderBottom: '1px solid var(--border-color)'
                    },
                    body: {
                        color: 'var(--text-color)',
                        backgroundColor: 'var(--card-bg)'
                    },
                    footer: {
                        backgroundColor: 'var(--card-bg)',
                        borderTop: '1px solid var(--border-color)'
                    }
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <ExclamationCircleOutlined style={{
                        color: 'var(--accent-color)',
                        fontSize: '24px',
                        marginRight: '12px'
                    }} />
                    <span style={{ color: 'var(--text-color)' }}>Вы точно хотите выйти?</span>
                </div>
            </Modal>
        </>
    );
};

export default Navbar;