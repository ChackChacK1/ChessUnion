import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Typography, Tag, Spin, message, Button,
    Row, Col, Space, Alert, Grid, Divider
} from 'antd';
import {
    CalendarOutlined, TrophyOutlined, TeamOutlined,
    UserAddOutlined, CheckCircleOutlined, ArrowLeftOutlined,
    UserOutlined, CrownOutlined, ClockCircleOutlined,
    InfoCircleOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [checkingRegistration, setCheckingRegistration] = useState(false);

    useEffect(() => {
        fetchTournament();
        checkAuth();
    }, [id]);

    useEffect(() => {
        if (isAuthenticated && tournament) {
            checkRegistration();
        }
    }, [isAuthenticated, tournament]);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    };

    const fetchTournament = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/api/tournament/${id}`);
            setTournament(response.data.body || response.data);
        } catch (error) {
            message.error('Ошибка загрузки турнира: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const checkRegistration = async () => {
        try {
            setCheckingRegistration(true);
            const response = await client.get(`/api/tournament/${id}/if_registered`);

            let registrationStatus = false;
            if (typeof response.data === 'boolean') {
                registrationStatus = response.data;
            } else if (response.data && typeof response.data.body === 'boolean') {
                registrationStatus = response.data.body;
            } else if (response.data && response.data.body !== undefined) {
                registrationStatus = Boolean(response.data.body);
            }

            setIsRegistered(registrationStatus);
        } catch (error) {
            console.error('Ошибка проверки регистрации:', error);
            message.error('Ошибка проверки регистрации');
        } finally {
            setCheckingRegistration(false);
        }
    };

    const handleRegistration = async () => {
        try {
            setRegistering(true);
            const response = await client.put(`/api/tournament/${id}/registration`);

            if (response.status === 200) {
                message.success('Вы успешно зарегистрировались на турнир!');
                window.location.reload();
            }
        } catch (error) {
            message.error('Ошибка регистрации: ' + (error.response?.data?.message || error.message));
        } finally {
            setRegistering(false);
        }
    };

    const getStageColor = (stage) => {
        const colors = {
            'ANNOUNCED': 'blue',
            'REGISTRATION': 'green',
            'IN_PROGRESS': 'orange',
            'FINISHED': 'red',
            'CANCELLED': 'gray'
        };
        return colors[stage] || 'default';
    };

    const translateStage = (stage) => {
        const translations = {
            'ANNOUNCED': 'Анонсирован',
            'REGISTRATION': 'Регистрация',
            'IN_PROGRESS': 'В процессе',
            'FINISHED': 'Завершен',
            'CANCELLED': 'Отменен'
        };
        return translations[stage] || stage;
    };

    const canRegister = () => {
        if (!isAuthenticated) return false;
        if (tournament.stage !== 'REGISTRATION') return false;
        if (tournament.maxAmountOfPlayers && tournament.players?.length >= tournament.maxAmountOfPlayers) return false;
        if (isRegistered) return false;
        return true;
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    if (!tournament) {
        return <Text style={{ color: 'var(--text-color)' }}>Турнир не найден</Text>;
    }

    return (
        <div style={{ padding: isMobile ? '12px' : '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Кнопка назад для мобильных */}
            {isMobile && (
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/tournaments')}
                    style={{ marginBottom: 16, color: 'var(--text-color)' }}
                >
                    Назад
                </Button>
            )}

            <Title level={isMobile ? 3 : 2} style={{ marginBottom: 24, color: 'var(--text-color)' }}>
                {tournament.name || 'Без названия'}
            </Title>

            <Row gutter={isMobile ? 0 : 16}>
                {/* Основная информация */}
                <Col xs={24} lg={16}>
                    <Card
                        style={{
                            marginBottom: 20,
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)'
                        }}
                        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {/* Статус */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <TrophyOutlined style={{ marginRight: 8, color: 'var(--accent-color)' }} />
                                <Text strong style={{ color: 'var(--text-color)' }}>Стадия: </Text>
                                <Tag
                                    color={getStageColor(tournament.stage)}
                                    style={{
                                        marginLeft: 8,
                                        color: 'var(--text-color)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                >
                                    {translateStage(tournament.stage)}
                                </Tag>
                            </div>

                            {/* Описание */}
                            {tournament.description && (
                                <div>
                                    <Text strong style={{ color: 'var(--text-color)' }}>Описание: </Text>
                                    <Paragraph style={{
                                        marginBottom: 0,
                                        marginTop: 8,
                                        color: 'var(--text-color)'
                                    }}>
                                        {tournament.description}
                                    </Paragraph>
                                </div>
                            )}

                            <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />

                            {/* Адрес проведения */}
                            {tournament.address && (
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <EnvironmentOutlined style={{
                                        marginRight: 8,
                                        color: 'var(--accent-color)',
                                        marginTop: '4px'
                                    }} />
                                    <div>
                                        <Text strong style={{ color: 'var(--text-color)' }}>Адрес проведения: </Text>
                                        <Text style={{ color: 'var(--text-color)' }}>{tournament.address}</Text>
                                    </div>
                                </div>
                            )}

                            <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />

                            {/* Даты */}
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                                    <Text strong style={{ color: 'var(--text-color)' }}>Дата начала: </Text>
                                    <Text style={{ marginLeft: 8, color: 'var(--text-color)' }}>
                                        {tournament.startDateTime ?
                                            dayjs(tournament.startDateTime).format('DD.MM.YYYY HH:mm') :
                                            'Не указана'}
                                    </Text>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <ClockCircleOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                                    <Text strong style={{ color: 'var(--text-color)' }}>Создан: </Text>
                                    <Text style={{ marginLeft: 8, color: 'var(--text-color)' }}>
                                        {tournament.createdAt ?
                                            dayjs(tournament.createdAt).format('DD.MM.YYYY HH:mm') :
                                            'Не указано'}
                                    </Text>
                                </div>
                            </Space>

                            <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />

                            {/* Статистика турнира */}
                            <Title level={5} style={{ color: 'var(--text-color)' }}>Информация о турнире</Title>

                            <Row gutter={16}>
                                <Col xs={12} sm={8}>
                                    <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                        <Title level={4} style={{ margin: 0, color: 'var(--primary-color)' }}>
                                            {tournament.currentRound || 0}
                                        </Title>
                                        <Text style={{
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            Текущий раунд
                                        </Text>
                                    </div>
                                </Col>

                                <Col xs={12} sm={8}>
                                    <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                        <Title level={4} style={{ margin: 0, color: 'var(--primary-color)' }}>
                                            {tournament.players?.length || 0}
                                        </Title>
                                        <Text style={{
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            Участников
                                        </Text>
                                    </div>
                                </Col>

                                {tournament.maxAmountOfPlayers && (
                                    <Col xs={12} sm={8}>
                                        <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                            <Title level={4} style={{ margin: 0, color: 'var(--primary-color)' }}>
                                                {tournament.maxAmountOfPlayers}
                                            </Title>
                                            <Text style={{
                                                fontSize: '12px',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                Макс. участников
                                            </Text>
                                        </div>
                                    </Col>
                                )}
                            </Row>

                            {/* Дополнительная информация */}
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                {tournament.minAmountOfPlayers && (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <InfoCircleOutlined style={{ marginRight: 8, color: 'var(--accent-color)' }} />
                                        <Text strong style={{ color: 'var(--text-color)' }}>Минимальное количество игроков: </Text>
                                        <Text style={{ marginLeft: 8, color: 'var(--text-color)' }}>{tournament.minAmountOfPlayers}</Text>
                                    </div>
                                )}

                                {tournament.maxAmountOfPlayers && (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <InfoCircleOutlined style={{ marginRight: 8, color: 'var(--accent-color)' }} />
                                        <Text strong style={{ color: 'var(--text-color)' }}>Максимальное количество игроков: </Text>
                                        <Text style={{ marginLeft: 8, color: 'var(--text-color)' }}>{tournament.maxAmountOfPlayers}</Text>
                                    </div>
                                )}

                                {tournament.maxAmountOfPlayers && tournament.players?.length && (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TeamOutlined style={{ marginRight: 8, color: 'var(--accent-color)' }} />
                                        <Text strong style={{ color: 'var(--text-color)' }}>Свободных мест: </Text>
                                        <Text style={{ marginLeft: 8, color: 'var(--text-color)' }}>
                                            {tournament.maxAmountOfPlayers - tournament.players.length}
                                        </Text>
                                    </div>
                                )}
                            </Space>
                        </Space>
                    </Card>

                    {/* Список зарегистрированных игроков */}
                    {tournament.players && tournament.players.length > 0 && (
                        <Card
                            title={
                                <Space>
                                    <TeamOutlined style={{ color: 'var(--text-color)' }} />
                                    <span style={{ color: 'var(--text-color)' }}>
                                        Участники ({tournament.players.length})
                                    </span>
                                </Space>
                            }
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                            bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                {tournament.players.map((player, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 0',
                                            borderBottom: index < tournament.players.length - 1 ?
                                                '1px solid var(--border-color)' : 'none'
                                        }}
                                    >
                                        <Space>
                                            <UserOutlined style={{ color: 'var(--primary-color)' }} />
                                            <Text style={{ color: 'var(--text-color)' }}>
                                                {player.fullName || 'Неизвестный игрок'}
                                            </Text>
                                        </Space>
                                        {player.rating && (
                                            <Tag
                                                color="blue"
                                                style={{
                                                    margin: 0,
                                                    color: 'var(--text-color)',
                                                    borderColor: 'var(--border-color)'
                                                }}
                                            >
                                                Рейтинг: {player.rating}
                                            </Tag>
                                        )}
                                    </div>
                                ))}
                            </Space>
                        </Card>
                    )}
                </Col>

                {/* Блок действий */}
                <Col xs={24} lg={8}>
                    <Card
                        title={<span style={{ color: 'var(--text-color)' }}>Действия</span>}
                        style={{
                            marginBottom: isMobile ? 20 : 0,
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)'
                        }}
                        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Button
                                type="primary"
                                block
                                size={isMobile ? 'large' : 'middle'}
                                onClick={() => navigate(`/matches/${tournament.id}`)}
                                style={{
                                    backgroundColor: 'var(--hover-color)',
                                    borderColor: 'var(--hover-color)'
                                }}
                            >
                                Посмотреть матчи
                            </Button>

                            {checkingRegistration ? (
                                <div style={{ textAlign: 'center' }}>
                                    <Spin size="small" />
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'var(--text-secondary)',
                                        marginTop: 4
                                    }}>
                                        Проверка регистрации...
                                    </div>
                                </div>
                            ) : isRegistered ? (
                                <Alert
                                    message="Вы зарегистрированы"
                                    description="Ожидайте начала турнира"
                                    type="success"
                                    icon={<CheckCircleOutlined />}
                                    showIcon
                                />
                            ) : canRegister() ? (
                                <Button
                                    type="primary"
                                    block
                                    icon={<UserAddOutlined />}
                                    loading={registering}
                                    onClick={handleRegistration}
                                    size={isMobile ? 'large' : 'middle'}
                                    style={{
                                        background: 'var(--accent-color)',
                                        borderColor: 'var(--accent-color)',
                                        height: isMobile ? '48px' : '40px'
                                    }}
                                >
                                    Зарегистрироваться
                                </Button>
                            ) : !isAuthenticated && tournament.stage === 'REGISTRATION' ? (
                                <Button
                                    type="dashed"
                                    block
                                    size={isMobile ? 'large' : 'middle'}
                                    onClick={() => navigate('/login')}
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    Войдите, чтобы зарегистрироваться
                                </Button>
                            ) : tournament.stage !== 'REGISTRATION' ? (
                                <Alert
                                    message="Регистрация закрыта"
                                    description="Этап регистрации завершен"
                                    type="warning"
                                    showIcon
                                />
                            ) : null}

                            {!isMobile && (
                                <Button
                                    type="default"
                                    block
                                    onClick={() => navigate('/tournaments')}
                                    style={{ color: '#4a4a4a' }}
                                >
                                    Назад к списку турниров
                                </Button>
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TournamentDetail;