import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Typography, Tag, Spin, message, Button,
    Row, Col, Space, Alert, Grid, Divider, Table, Popconfirm
} from 'antd';
import {
    CalendarOutlined, TrophyOutlined, TeamOutlined,
    UserAddOutlined, CheckCircleOutlined, ArrowLeftOutlined,
    UserOutlined, CrownOutlined, ClockCircleOutlined,
    InfoCircleOutlined, EnvironmentOutlined, DeleteOutlined
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
    const [isAdmin, setIsAdmin] = useState(false);
    const [deleting, setDeleting] = useState(false);
    // Функции для получения цвета и перевода стадии
    const getStageColor = (stage) => {
        const colors = {
            'REGISTRATION': 'green',
            'PLAYING': 'blue',
            'FINISHED': 'red'
        };
        return colors[stage] || 'default';
    };

    const translateStage = (stage) => {
        const translations = {
            'REGISTRATION': 'Регистрация',
            'PLAYING': 'В процессе',
            'FINISHED': 'Завершен'
        };
        return translations[stage] || stage;
    };

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
        setIsAdmin(localStorage.getItem('role') === 'ADMIN');
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

                // 1. Мгновенно обновляем статус регистрации
                setIsRegistered(true);

                // 2. Обновляем данные турнира
                const updatedResponse = await client.get(`/api/tournament/${id}`);
                const updatedData = updatedResponse.data.body || updatedResponse.data;
                setTournament(updatedData);

                // 3. Перепроверяем регистрацию (на всякий случай)
                await checkRegistration();
            }
        } catch (error) {
            message.error('Ошибка регистрации: ' + (error.response?.data?.message || error.message));
        } finally {
            setRegistering(false);
        }
    };

    const canRegister = () => {
        if (!isAuthenticated) return false;
        if (tournament.stage !== 'REGISTRATION') return false;
        if (tournament.maxAmountOfPlayers && tournament.players?.length >= tournament.maxAmountOfPlayers) return false;
        if (isRegistered) return false;
        return true;
    };

    const handleDeleteTournament = async () => {
        try {
            setDeleting(true);
            await client.delete(`/api/admin/tournament/${id}`);
            message.success('Турнир успешно удалён');
            navigate('/tournaments');
        } catch (error) {
            message.error('Ошибка удаления турнира: ' + (error.response?.data?.message || error.message));
        } finally {
            setDeleting(false);
        }
    };

    // Обработчик клика по игроку - используем userId
    const handlePlayerClick = (userId) => {
        if (userId) {
            navigate(`/profile/${userId}`);
        }
    };

    // Колонки для таблицы участников (стадия регистрации)
    const registrationColumns = [
        {
            title: <span style={{ color: 'var(--text-color)' }}>Игрок</span>,
            dataIndex: 'fullName',
            key: 'fullName',
            render: (name, record) => (
                <Button
                    type="link"
                    style={{ padding: 0, height: 'auto' }}
                    onClick={() => handlePlayerClick(record.userId)}
                >
                    <Text style={{
                        color: 'var(--primary-color)',
                        textDecoration: 'none',
                        transition: 'text-decoration 0.3s'
                    }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                        {name || 'Неизвестный игрок'}
                    </Text>
                </Button>
            )
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Рейтинг</span>,
            dataIndex: 'rating',
            key: 'rating',
            width: 100,
            align: 'center',
            render: (rating) => (
                <Tag color="blue" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    {rating || '-'}
                </Tag>
            )
        }
    ];

    // Колонки для турнирной таблицы (стадия PLAYING или FINISHED)
    const tournamentTableColumns = [
        {
            title: <span style={{ color: 'var(--text-color)' }}>Место</span>,
            dataIndex: 'place',
            key: 'place',
            width: 80,
            align: 'center',
            render: (place) => (
                <Tag color="blue" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    {place || '-'}
                </Tag>
            )
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Игрок</span>,
            dataIndex: 'fullName',
            key: 'fullName',
            render: (name, record) => (
                <Button
                    type="link"
                    style={{ padding: 0, height: 'auto' }}
                    onClick={() => handlePlayerClick(record.userId)}
                >
                    <Text style={{
                        color: 'var(--primary-color)',
                        textDecoration: 'none',
                        transition: 'text-decoration 0.3s'
                    }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                        {name || 'Неизвестный игрок'}
                    </Text>
                </Button>
            )
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Очки</span>,
            dataIndex: 'score',
            key: 'score',
            width: 100,
            align: 'center',
            render: (score) => (
                <Tag color="green" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    {score?.toFixed(1) || '0.0'}
                </Tag>
            )
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Доп. очки</span>,
            dataIndex: 'secondScore',
            key: 'secondScore',
            width: 120,
            align: 'center',
            render: (secondScore) => (
                <Tag color="gold" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    {secondScore?.toFixed(1) || '0.0'}
                </Tag>
            )
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Рейтинг</span>,
            dataIndex: 'rating',
            key: 'rating',
            width: 100,
            align: 'center',
            render: (rating) => (
                <Tag color="blue" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    {rating || '-'}
                </Tag>
            )
        }
    ];

    // Выбираем какие колонки использовать в зависимости от стадии турнира
    const getTableColumns = () => {
        if (tournament.stage === 'REGISTRATION') {
            return registrationColumns;
        } else {
            return tournamentTableColumns;
        }
    };

    // Выбираем заголовок в зависимости от стадии турнира
    const getTableTitle = () => {
        if (tournament.stage === 'REGISTRATION') {
            return `Зарегистрированные участники (${tournament.players?.length || 0})`;
        } else {
            return `Турнирная таблица (${tournament.players?.length || 0})`;
        }
    };

    const playersForTable = (() => {
        if (!tournament?.players) return [];
        if (tournament.stage === 'REGISTRATION') {
            return [...tournament.players].sort(
                (a, b) => (b?.rating ?? 0) - (a?.rating ?? 0)
            );
        }
        return tournament.players;
    })();

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    if (!tournament) {
        return <Text style={{ color: 'var(--text-color)' }}>Турнир не найден</Text>;
    }
    const isPlaying = tournament.stage === 'PLAYING';
    const colSpan = isPlaying ? 8 : 12;
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

            <Title level={isMobile ? 3 : 2} style={{ marginBottom: 24, color: '#ffffff' }}>
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

                            {/* Описание - показываем только если есть */}
                            {tournament.description && (
                                <div>
                                    <Text strong style={{ color: 'var(--text-color)' }}>Описание: </Text>
                                    <Paragraph style={{
                                        marginBottom: 0,
                                        marginTop: 4,
                                        color: 'var(--text-color)'
                                    }}>
                                        {tournament.description}
                                    </Paragraph>
                                </div>
                            )}

                            {/* Адрес проведения - показываем только если есть */}
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

                            {/* Даты */}
                            <div style={{ marginTop: tournament.address || tournament.description ? 16 : 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
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
                            </div>

                            {/* Статистика турнира */}
                            <Title level={5} style={{ color: 'var(--text-color)', marginTop: 16 }}>
                                Информация о турнире
                            </Title>

                            <Row gutter={16}>
                                {isPlaying && (
                                    <Col xs={12} sm={colSpan}>
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
                                )}
                                <Col xs={12} sm={colSpan}>
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
                                    <Col xs={12} sm={colSpan}>
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

                                {(
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

                    {/* Список зарегистрированных игроков - всегда показываем */}
                    <Card
                        title={
                            <Space>
                                <TeamOutlined style={{ color: 'var(--text-color)' }} />
                                <span style={{ color: 'var(--text-color)' }}>
                                    {getTableTitle()}
                                </span>
                            </Space>
                        }
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)'
                        }}
                        bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
                    >
                        <Table
                            columns={getTableColumns()}
                            dataSource={playersForTable.map((player, index) => ({
                                ...player,
                                key: player?.id ?? index,
                                place: (tournament.stage !== 'REGISTRATION')
                                    ? index + 1
                                    : undefined
                            }))}
                            pagination={false}
                            size="small"
                            locale={{
                                emptyText: 'Нет зарегистрированных участников'
                            }}
                        />
                    </Card>
                </Col>

                {/* Блок действий */}
                <Col xs={24} lg={8}>
                    <Card
                        title={<span style={{ color: 'var(--text-color)' }}>Действия</span>}
                        style={{
                            marginTop: 20,
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
                                    style={{ color: '#222121' }}
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

            {/* Кнопка удаления турнира (только для админа) */}
            {isAdmin && (
                <Card
                    style={{
                        marginTop: 20,
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                    bodyStyle={{ padding: isMobile ? '16px' : '14px' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Popconfirm
                            title="Удалить турнир?"
                            description="Вы уверены, что хотите удалить этот турнир? Это действие нельзя отменить."
                            okText="Да"
                            cancelText="Нет"
                            onConfirm={handleDeleteTournament}
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="primary"
                                danger
                                block
                                icon={<DeleteOutlined />}
                                loading={deleting}
                                size={isMobile ? 'large' : 'middle'}
                            >
                                Удалить турнир
                            </Button>
                        </Popconfirm>
                    </Space>
                </Card>
            )}
        </div>
    );
};

export default TournamentDetail;