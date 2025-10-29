import { Button, Form, Input, message, Card, Typography, Space, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useState } from 'react';

const { Title } = Typography;

const Registration = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const sendConfirmationCode = async () => {
        const phoneNumber = form.getFieldValue('phoneNumber');

        if (!phoneNumber) {
            message.error('Введите номер телефона');
            return;
        }

        setSendingCode(true);
        setErrorMessage('');
        try {
            await client.post('/api/phone/confirmation/send', { number: phoneNumber });
            message.success('Код подтверждения отправлен');
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.error) {
                const errorText = 'Неверный формат номера телефона. Формат: 89990000000 или +79990000000';
                setErrorMessage(errorText);
                message.error(`Ошибка: ${errorText}`);
            } else {
                const errorText = 'Ошибка при отправке кода: ' + (error.message || 'Неизвестная ошибка');
                setErrorMessage(errorText);
                message.error(errorText);
            }
        } finally {
            setSendingCode(false);
        }
    };

    const verifyConfirmationCode = async () => {
        const phoneNumber = form.getFieldValue('phoneNumber');
        const confirmationCode = form.getFieldValue('confirmationCode');

        if (!phoneNumber) {
            message.error('Введите номер телефона');
            return;
        }

        if (!confirmationCode) {
            message.error('Введите код подтверждения');
            return;
        }

        setVerifyingCode(true);
        setErrorMessage('');
        try {
            await client.post('/api/phone/confirmation/confirm', {
                number: phoneNumber,
                code: confirmationCode
            });
            message.success('Номер телефона подтвержден');
            setPhoneVerified(true);
        } catch (error) {
            const errorData = error.response?.data;
            let errorText = 'Неверный код подтверждения';

            if (errorData?.body) {
                errorText = errorData.body;
            } else if (errorData?.details && errorData.details.length > 0) {
                errorText = errorData.details.join(', ');
            }

            setErrorMessage(errorText);
            message.error(`Ошибка: ${errorText}`);
            setPhoneVerified(false);
        } finally {
            setVerifyingCode(false);
        }
    };

    const onFinish = async (values) => {
        if (!phoneVerified) {
            message.error('Подтвердите номер телефона перед регистрацией');
            return;
        }

        setSubmitLoading(true);
        setErrorMessage('');
        try {
            await client.post('/api/auth/registration', values);
            message.success('Регистрация успешна! Теперь войдите.');
            navigate('/login');
        } catch (error) {
            const errorData = error.response?.data;
            let errorText = 'Ошибка при регистрации';

            if (errorData?.details && errorData.details.length > 0) {
                errorText = errorData.details.join(', ');
            } else if (errorData?.message) {
                errorText = errorData.message;
            } else if (error.message) {
                errorText = error.message;
            }

            setErrorMessage(errorText);
            message.error(`Ошибка: ${errorText}`);
        } finally {
            setSubmitLoading(false);
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

                {errorMessage && (
                    <Alert
                        message="Ошибка"
                        description={errorMessage}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setErrorMessage('')}
                        style={{
                            marginBottom: 20,
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)'
                        }}
                    />
                )}

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
                        name="surName"
                        label={<span style={{ color: 'var(--text-color)' }}>Отчество</span>}
                        rules={[{ required: true, message: 'Введите отчество' }]}
                    >
                        <Input
                            placeholder="Ваше отчество"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label={<span style={{ color: 'var(--text-color)' }}>Номер телефона</span>}
                        rules={[{ required: true, message: 'Введите номер телефона' }]}
                    >
                        <Input
                            placeholder="81231231212 или +71231231212"
                            addonAfter={
                                <Button
                                    type="link"
                                    onClick={sendConfirmationCode}
                                    loading={sendingCode}
                                    style={{
                                        color: 'var(--primary-color)',
                                        padding: 0
                                    }}
                                >
                                    Отправить код
                                </Button>
                            }
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmationCode"
                        label={<span style={{ color: 'var(--text-color)' }}>Код подтверждения</span>}
                        rules={[{ required: true, message: 'Введите код подтверждения' }]}
                    >
                        <Input
                            placeholder="Введите код из SMS"
                            addonAfter={
                                <Button
                                    type="link"
                                    onClick={verifyConfirmationCode}
                                    loading={verifyingCode}
                                    style={{
                                        color: phoneVerified ? 'var(--success-color)' : 'var(--primary-color)',
                                        padding: 0
                                    }}
                                >
                                    {phoneVerified ? '✓ Проверено' : 'Проверить код'}
                                </Button>
                            }
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                borderColor: phoneVerified ? 'var(--success-color)' : 'var(--border-color)'
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
                            loading={submitLoading}
                            style={{
                                width: '100%',
                                backgroundColor: 'var(--hover-color)',
                                borderColor: 'var(--hover-color)',
                                height: '40px'
                            }}
                            disabled={!phoneVerified}
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