import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, List, Typography, Divider, Tag, Spin, message,
    Space, Row, Col, Statistic, Pagination, Button, Avatar
} from 'antd';
import {
    UserOutlined, CalendarOutlined, CrownOutlined,
    FallOutlined, MinusOutlined, BarChartOutlined,
    ArrowLeftOutlined, TrophyOutlined
} from '@ant-design/icons';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const PublicProfile = () => {
    const { id } = useParams(); // Получаем ID из URL
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [matchesPage, setMatchesPage] = useState({
        content: [],
        totalPages: 1,
        totalElements: 0
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);

    useEffect(() => {
        fetchPublicProfile();
    }, [id, currentPage]);

    const fetchPublicProfile = async () => {
        setLoading(true);
        try {
            const response = await client.get(`/api/user/profile/${id}`, {
                params: {
                    page: currentPage,
                    size: pageSize,
                    sort: 'createdAt,desc'
                }
            });
            const profileData = response.data;
            setProfile(profileData);

            if (profileData.matches) {
                setMatchesPage(profileData.matches);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                message.error('Пользователь не найден');
            } else {
                message.error('Ошибка загрузки профиля: ' +
                    (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page - 1);
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

    const calculateWinPercentage = () => {
        if (!profile?.amountOfMatches || profile.amountOfMatches === 0) return 0;
        return ((profile.amountOfWins / profile.amountOfMatches) * 100).toFixed(1);
    };

    const getFullName = () => {
        const parts = [];
        if (profile?.lastName) parts.push(profile.lastName);
        if (profile?.firstName) parts.push(profile.firstName);
        if (profile?.surName) parts.push(profile.surName);
        return parts.join(' ') || 'Пользователь';
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{
                padding: '50px',
                textAlign: 'center',
                color: 'var(--text-color)'
            }}>
                <Title style = {{color : '#ffffff'}} level={3}>Пользователь не найден</Title>
                <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    style={{ marginTop: 20 }}
                >
                    Вернуться назад
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Кнопка назад */}
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ marginBottom: 16 }}
            >
                Назад
            </Button>

            <Card
                bordered={false}
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                {/* Шапка профиля */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: 24,
                    flexWrap: 'wrap'
                }}>
                    <Avatar
                        size={80}
                        icon={<UserOutlined />}
                        style={{
                            backgroundColor: 'var(--primary-color)',
                            color: 'white'
                        }}
                    />
                    <div style={{ flex: 1 }}>
                        <Title level={3} style={{
                            margin: 0,
                            color: 'var(--text-color)',
                            marginBottom: 8
                        }}>
                            {getFullName()}
                        </Title>
                        <Space wrap>
                            <Tag icon={<TrophyOutlined />} color="gold">
                                Рейтинг: {profile.rating?.toFixed(2) || 'Нет данных'}
                            </Tag>
                            <Tag icon={<CalendarOutlined />} color="blue">
                                На сайте с {dayjs(profile.createdAt).format('DD.MM.YYYY')}
                            </Tag>
                        </Space>
                    </div>
                </div>

                {/* О себе */}
                {profile.aboutSelf && (
                    <>
                        <Divider orientation="left" style={{
                            color: 'var(--text-color)',
                            borderColor: 'var(--border-color)'
                        }}>
                            О себе
                        </Divider>
                        <Card
                            size="small"
                            style={{
                                backgroundColor: 'var(--background-color)',
                                borderColor: 'var(--border-color)',
                                marginBottom: 24
                            }}
                        >
                            <Text style={{
                                color: 'var(--text-color)',
                                fontSize: '16px',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap'
                            }}>
                                {profile.aboutSelf}
                            </Text>
                        </Card>
                    </>
                )}

                {/* Статистика игр */}
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
                                borderColor: 'var(--border-color)',
                                textAlign: 'center'
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
                                borderColor: 'var(--border-color)',
                                textAlign: 'center'
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
                                borderColor: 'var(--border-color)',
                                textAlign: 'center'
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
                                borderColor: 'var(--border-color)',
                                textAlign: 'center'
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
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12}>
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
                                    precision={1}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
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
                                    precision={1}
                                />
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* История матчей */}
                <Divider orientation="left" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    История матчей {matchesPage.totalElements > 0 && `(${matchesPage.totalElements})`}
                </Divider>

                {matchesPage.content && matchesPage.content.length > 0 ? (
                    <>
                        <List
                            dataSource={matchesPage.content}
                            style={{ color: 'var(--text-color)' }}
                            renderItem={(match) => (
                                <List.Item style={{
                                    borderBottom: '1px solid var(--border-color)',
                                    padding: '16px 0'
                                }}>
                                    <div style={{ width: '100%' }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr auto 1fr',
                                            gap: '12px',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{
                                                textAlign: 'right',
                                                fontWeight: 'bold',
                                                color: 'var(--text-color)'
                                            }}>
                                                {match.whitePlayer?.fullName || 'Неизвестный игрок'}
                                            </div>

                                            <Tag
                                                color={getResultColor(match.result)}
                                                style={{
                                                    fontSize: '14px',
                                                    padding: '4px 12px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {getResultText(match.result)}
                                            </Tag>

                                            <div style={{
                                                textAlign: 'left',
                                                fontWeight: 'bold',
                                                color: 'var(--text-color)'
                                            }}>
                                                {match.blackPlayer?.fullName || 'Неизвестный игрок'}
                                            </div>
                                        </div>

                                        {match.createdAt && (
                                            <div style={{
                                                textAlign: 'center',
                                                marginTop: 8,
                                                fontSize: '12px',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                <CalendarOutlined style={{ marginRight: 4 }} />
                                                {dayjs(match.createdAt).format('DD.MM.YYYY HH:mm')}
                                            </div>
                                        )}
                                    </div>
                                </List.Item>
                            )}
                        />

                        {/* Пагинация */}
                        {matchesPage.totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: 24
                            }}>
                                <Pagination
                                    current={currentPage + 1}
                                    total={matchesPage.totalElements}
                                    pageSize={pageSize}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    style={{color: 'var(--text-color)'}}
                                    showTotal={(total) => `Всего ${total} матчей`}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: 'var(--text-secondary)'
                    }}>
                        <BarChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                        <Text style={{ color: 'var(--text-secondary)' }}>
                            У пользователя пока нет сыгранных матчей
                        </Text>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PublicProfile;