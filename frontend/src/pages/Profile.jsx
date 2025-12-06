import { useEffect, useState } from 'react';
import { Card, List, Typography, Divider, Tag, Spin, message, Button, Space, Row, Col, Statistic } from 'antd'; // Добавили Row, Col, Statistic
import { UserOutlined, MailOutlined, TrophyOutlined, CalendarOutlined, EditOutlined, LockOutlined, CrownOutlined, FallOutlined, MinusOutlined, BarChartOutlined } from '@ant-design/icons'; // Добавили иконки для статистики
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

    const handleChangePassword = () => {
        navigate('/change-password');
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

    // Функция для расчета процента побед
    const calculateWinPercentage = () => {
        if (!profile?.amountOfMatches || profile.amountOfMatches === 0) return 0;
        return ((profile.amountOfWins / profile.amountOfMatches) * 100).toFixed(1);
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    if (!profile) {
        return <Text style={{ color: 'var(--text-color)' }}>Профиль не найден</Text>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
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
                    <Space>
                        <Button
                            icon={<LockOutlined />}
                            onClick={handleChangePassword}
                            style={{
                                backgroundColor: 'var(--primary-color)',
                                borderColor: 'var(--primary-color)',
                                color: 'white'
                            }}
                        >
                            Смена пароля
                        </Button>
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
                    </Space>
                }
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    <UserOutlined style={{
                        fontSize: 24,
                        marginRight: 10,
                        color: 'var(--text-secondary)'
                    }} />
                    <Title level={4} style={{ margin: 0, color: 'var(--text-color)' }}>
                        {profile.firstName} {profile.lastName} {profile.surName}
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

                {/* Новая секция со статистикой */}
                <Divider orientation="left" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    Статистика игр
                </Divider>

                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={12} sm={6}>
                        <Card
                            size="small"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <Statistic
                                title="Всего игр"
                                value={profile.amountOfMatches || 0}
                                prefix={<BarChartOutlined />}
                                valueStyle={{ color: 'var(--text-color)' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card
                            size="small"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <Statistic
                                title="Победы"
                                value={profile.amountOfWins || 0}
                                prefix={<CrownOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card
                            size="small"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <Statistic
                                title="Поражения"
                                value={profile.amountOfLosses || 0}
                                prefix={<FallOutlined style={{ color: '#ff4d4f' }} />}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card
                            size="small"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <Statistic
                                title="Ничьи"
                                value={profile.amountOfDraws || 0}
                                prefix={<MinusOutlined style={{ color: '#1890ff' }} />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Дополнительная статистика */}
                {profile.amountOfMatches > 0 && (
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                        <Col xs={12} sm={6}>
                            <Card
                                size="small"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                <Statistic
                                    title="Процент побед"
                                    value={calculateWinPercentage()}
                                    suffix="%"
                                    valueStyle={{ color: 'var(--text-color)' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card
                                size="small"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                <Statistic
                                    title="Очков набрано"
                                    value={(profile.amountOfWins * 1 + profile.amountOfDraws * 0.5).toFixed(1)}
                                    valueStyle={{ color: 'var(--text-color)' }}
                                    titleStyle={{ color: 'var(--text-secondary)' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                )}

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