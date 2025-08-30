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
        return <Text>Турнир не найден</Text>;
    }

    return (
        <div style={{ padding: isMobile ? '12px' : '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Кнопка назад для мобильных */}
            {isMobile && (
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/tournaments')}
                    style={{ marginBottom: 16 }}
                >
                    Назад
                </Button>
            )}

            <Title level={isMobile ? 3 : 2} style={{ marginBottom: 24 }}>
                {tournament.name || 'Без названия'}
            </Title>

            <Row gutter={isMobile ? 0 : 16}>
                {/* Основная информация */}
                <Col xs={24} lg={16}>
                    <Card
                        style={{ marginBottom: 20 }}
                        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {/* Статус */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
                                <Text strong>Стадия: </Text>
                                <Tag color={getStageColor(tournament.stage)} style={{ marginLeft: 8 }}>
                                    {translateStage(tournament.stage)}
                                </Tag>
                            </div>

                            {/* Описание */}
                            {tournament.description && (
                                <div>
                                    <Text strong>Описание: </Text>
                                    <Paragraph style={{ marginBottom: 0, marginTop: 8 }}>
                                        {tournament.description}
                                    </Paragraph>
                                </div>
                            )}

                            <Divider style={{ margin: '16px 0' }} />

                            {/* Адрес проведения */}
                            {tournament.address && (
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <EnvironmentOutlined style={{ marginRight: 8, color: '#ff4d4f', marginTop: '4px' }} />
                                    <div>
                                        <Text strong>Адрес проведения: </Text>
                                        <Text>{tournament.address}</Text>
                                    </div>
                                </div>
                            )}

                            <Divider style={{ margin: '16px 0' }} />

                            {/* Даты */}
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                    <Text strong>Дата начала: </Text>
                                    <Text style={{ marginLeft: 8 }}>
                                        {tournament.startDateTime ?
                                            dayjs(tournament.startDateTime).format('DD.MM.YYYY HH:mm') :
                                            'Не указана'}
                                    </Text>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <ClockCircleOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                                    <Text strong>Создан: </Text>
                                    <Text style={{ marginLeft: 8 }}>
                                        {tournament.createdAt ?
                                            dayjs(tournament.createdAt).format('DD.MM.YYYY HH:mm') :
                                            'Не указано'}
                                    </Text>
                                </div>
                            </Space>

                            <Divider style={{ margin: '16px 0' }} />

                            {/* Статистика турнира */}
                            <Title level={5}>Информация о турнире</Title>

                            <Row gutter={16}>
                                <Col xs={12} sm={8}>
                                    <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                            {tournament.currentRound || 0}
                                        </Title>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Текущий раунд</Text>
                                    </div>
                                </Col>

                                <Col xs={12} sm={8}>
                                    <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                        <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                                            {tournament.players?.length || 0}
                                        </Title>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Участников
                                        </Text>
                                    </div>
                                </Col>

                                {tournament.maxAmountOfPlayers && (
                                    <Col xs={12} sm={8}>
                                        <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                            <Title level={4} style={{ margin: 0, color: '#fa541c' }}>
                                                {tournament.maxAmountOfPlayers}
                                            </Title>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
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
                                        <InfoCircleOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
                                        <Text strong>Минимальное количество игроков: </Text>
                                        <Text style={{ marginLeft: 8 }}>{tournament.minAmountOfPlayers}</Text>
                                    </div>
                                )}

                                {tournament.maxAmountOfPlayers && (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <InfoCircleOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                                        <Text strong>Максимальное количество игроков: </Text>
                                        <Text style={{ marginLeft: 8 }}>{tournament.maxAmountOfPlayers}</Text>
                                    </div>
                                )}

                                {tournament.maxAmountOfPlayers && tournament.players?.length && (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TeamOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                                        <Text strong>Свободных мест: </Text>
                                        <Text style={{ marginLeft: 8 }}>
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
                                    <TeamOutlined />
                                    <span>Участники ({tournament.players.length})</span>
                                </Space>
                            }
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
                                            borderBottom: index < tournament.players.length - 1 ? '1px solid #f0f0f0' : 'none'
                                        }}
                                    >
                                        <Space>
                                            <UserOutlined style={{ color: '#1890ff' }} />
                                            <Text>{player.fullName || 'Неизвестный игрок'}</Text>
                                        </Space>
                                        {player.rating && (
                                            <Tag color="blue" style={{ margin: 0 }}>
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
                        title="Действия"
                        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
                        style={{ marginBottom: isMobile ? 20 : 0 }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Button
                                type="primary"
                                block
                                size={isMobile ? 'large' : 'middle'}
                                onClick={() => navigate(`/matches/${tournament.id}`)}
                            >
                                Посмотреть матчи
                            </Button>

                            {checkingRegistration ? (
                                <div style={{ textAlign: 'center' }}>
                                    <Spin size="small" />
                                    <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
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
                                        background: '#52c41a',
                                        borderColor: '#52c41a',
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