import { useEffect, useState } from 'react';
import { Card, List, Typography, Divider, Tag, Spin, message, Button } from 'antd';
import { UserOutlined, MailOutlined, TrophyOutlined, CalendarOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await client.get('/api/user/profile');
                setProfile(response.data);
            } catch (error) {
                message.error('Ошибка загрузки профиля: ' + error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleEdit = () => {
        navigate('/profile/edit');
    };

    const getResultText = (result) => {
        switch (result) {
            case 1: return 'Победа белых';
            case 0: return 'Победа чёрных';
            case 0.5: return 'Ничья';
            default: return 'Не завершён';
        }
    };

    const getResultColor = (result) => {
        switch (result) {
            case 1: return 'green';
            case 0: return 'red';
            case 0.5: return 'blue';
            default: return 'gray';
        }
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    if (!profile) {
        return <Text style={{ color: 'var(--text-color)' }}>Профиль не найден</Text>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Card
                title={
                    <span style={{ color: 'var(--text-color)' }}>
                        Профиль пользователя
                    </span>
                }
                bordered={false}
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
                extra={
                    <Button
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                        type="primary"
                        style={{
                            backgroundColor: 'var(--hover-color)',
                            borderColor: 'var(--hover-color)'
                        }}
                    >
                        Редактировать
                    </Button>
                }
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    <UserOutlined style={{
                        fontSize: 24,
                        marginRight: 10,
                        color: 'var(--text-secondary)'
                    }} />
                    <Title level={4} style={{ margin: 0, color: 'var(--text-color)' }}>
                        {profile.firstName} {profile.lastName}
                    </Title>
                </div>

                <Divider orientation="left" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    Основная информация
                </Divider>

                <div style={{ marginBottom: 20 }}>
                    <p style={{ color: 'var(--text-color)' }}>
                        <Text strong style={{ color: 'var(--text-color)' }}>Логин:</Text> {profile.username}
                    </p>
                    <p style={{ color: 'var(--text-color)' }}>
                        <Text strong style={{ color: 'var(--text-color)' }}>Email:</Text> {profile.email || 'Не указан'}
                    </p>
                    <p style={{ color: 'var(--text-color)' }}>
                        <Text strong style={{ color: 'var(--text-color)' }}>Рейтинг:</Text>
                        <Tag color="gold" style={{
                            color: 'var(--text-color)',
                            borderColor: 'var(--border-color)'
                        }}>
                            {profile.rating || 'Нет данных'}
                        </Tag>
                    </p>
                    <p style={{ color: 'var(--text-color)' }}>
                        <CalendarOutlined style={{
                            marginRight: 8,
                            color: 'var(--text-secondary)'
                        }} />
                        <Text strong style={{ color: 'var(--text-color)' }}>Дата регистрации:</Text>
                        <span style={{ color: 'var(--text-color)' }}>
                            {dayjs(profile.createdAt).format('DD.MM.YYYY HH:mm')}
                        </span>
                    </p>
                </div>

                <Divider orientation="left" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    История матчей
                </Divider>

                {profile.matches && profile.matches.length > 0 ? (
                    <List
                        dataSource={profile.matches}
                        style={{ color: 'var(--text-color)' }}
                        renderItem={(match) => (
                            <List.Item style={{
                                borderBottom: '1px solid var(--border-color)',
                                padding: '12px 0'
                            }}>
                                <div style={{ width: '100%' }}>
                                    {/* Заголовки столбцов */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto 1fr',
                                        textAlign: 'center',
                                        marginBottom: 8,
                                        fontWeight: 'bold',
                                        color: 'var(--text-color)'
                                    }}>
                                        <span>Белые</span>
                                        <span>Результат</span>
                                        <span>Чёрные</span>
                                    </div>

                                    {/* Данные матча */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto 1fr',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        color: 'var(--text-color)'
                                    }}>
                                        <Text strong style={{ color: 'var(--text-color)' }}>
                                            {match.whitePlayer?.fullName || 'Неизвестный игрок'}
                                        </Text>

                                        <Tag
                                            color={getResultColor(match.result)}
                                            style={{
                                                margin: '0 10px',
                                                color: 'var(--text-color)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                        >
                                            {getResultText(match.result)}
                                        </Tag>

                                        <Text strong style={{ color: 'var(--text-color)' }}>
                                            {match.blackPlayer?.fullName || 'Неизвестный игрок'}
                                        </Text>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text style={{ color: 'var(--text-color)' }}>Матчей пока нет</Text>
                )}
            </Card>
        </div>
    );
};

export default Profile;