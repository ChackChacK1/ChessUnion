import { useEffect, useState } from 'react';
import { Card, List, Typography, Divider, Tag, Spin, message } from 'antd';
import { UserOutlined, MailOutlined, TrophyOutlined, CalendarOutlined } from '@ant-design/icons';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // Функция для отображения результата матча
    const getResultText = (result) => {
        switch (result) {
            case 1: return 'Победа белых';
            case 0: return 'Победа чёрных';
            case 0.5: return 'Ничья';
            default: return 'Не завершён';
        }
    };

    // Функция для цвета тега результата
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
        return <Text>Профиль не найден</Text>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Card title="Профиль пользователя" bordered={false}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    <UserOutlined style={{ fontSize: 24, marginRight: 10 }} />
                    <Title level={4} style={{ margin: 0 }}>
                        {profile.firstName} {profile.lastName}
                    </Title>
                </div>

                <Divider orientation="left">Основная информация</Divider>
                <div style={{ marginBottom: 20 }}>
                    <p>
                        <Text strong>Логин:</Text> {profile.username}
                    </p>
                    <p>
                        <Text strong>Email:</Text> {profile.email || 'Не указан'}
                    </p>
                    <p>
                        <Text strong>Рейтинг:</Text> <Tag color="gold">{profile.rating || 'Нет данных'}</Tag>
                    </p>
                    <p>
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        <Text strong>Дата регистрации:</Text> {dayjs(profile.createdAt).format('DD.MM.YYYY HH:mm')}
                    </p>
                </div>

                <Divider orientation="left">История матчей</Divider>
                {profile.matches && profile.matches.length > 0 ? (
                    <List
                        dataSource={profile.matches}
                        renderItem={(match) => (
                            <List.Item>
                                <div style={{ width: '100%' }}>
                                    {/* Заголовки столбцов */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto 1fr',
                                        textAlign: 'center',
                                        marginBottom: 8,
                                        fontWeight: 'bold'
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
                                        textAlign: 'center'
                                    }}>
                                        <Text strong>{match.whitePlayer?.fullName || 'Неизвестный игрок'}</Text>

                                        <Tag color={getResultColor(match.result)} style={{ margin: '0 10px' }}>
                                            {getResultText(match.result)}
                                        </Tag>

                                        <Text strong>{match.blackPlayer?.fullName || 'Неизвестный игрок'}</Text>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text>Матчей пока нет</Text>
                )}
            </Card>
        </div>
    );
};

export default Profile;;