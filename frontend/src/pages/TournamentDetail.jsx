import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Tag, Spin, message, Button, Row, Col, Space, Alert } from 'antd';
import { CalendarOutlined, TrophyOutlined, TeamOutlined, UserAddOutlined, CheckCircleOutlined } from '@ant-design/icons';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const TournamentDetail = () => {
    const { id } = useParams();
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
            // Получаем данные из response.data.body
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

            console.log('Raw registration response:', response.data);

            // Обрабатываем разные форматы ответа
            let registrationStatus = false;

            if (typeof response.data === 'boolean') {
                registrationStatus = response.data;
            } else if (response.data && typeof response.data.body === 'boolean') {
                registrationStatus = response.data.body;
            } else if (response.data && response.data.body !== undefined) {
                registrationStatus = Boolean(response.data.body);
            }

            console.log('Parsed registration status:', registrationStatus);
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
            console.log('Registration response:', response); // Добавьте лог

            if (response.status === 200) {
                message.success('Вы успешно зарегистрировались на турнир!');
                // Полная перезагрузка страницы
                window.location.reload();
            }

        } catch (error) {
            console.error('Registration error:', error); // Лог ошибки
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

    // Добавим отладочную информацию
    console.log('Tournament data:', tournament);
    console.log('Registration status:', isRegistered);

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Title level={2}>{tournament.name || 'Без названия'}</Title>

            <Row gutter={16}>
                <Col span={16}>
                    <Card style={{ marginBottom: 20 }}>
                        <Title level={4}>Информация о турнире</Title>

                        <Paragraph>
                            <Text strong>Описание: </Text>
                            {tournament.description || 'Описание отсутствует'}
                        </Paragraph>

                        <div style={{ marginBottom: 10 }}>
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            <Text strong>Дата начала: </Text>
                            {tournament.startDateTime ?
                                dayjs(tournament.startDateTime).format('DD.MM.YYYY HH:mm') :
                                'Дата не указана'}
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <TrophyOutlined style={{ marginRight: 8 }} />
                            <Text strong>Стадия: </Text>
                            <Tag color={getStageColor(tournament.stage)}>
                                {translateStage(tournament.stage)}
                            </Tag>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <Text strong>Текущий раунд: </Text>
                            {tournament.currentRound || 0}
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <TeamOutlined style={{ marginRight: 8 }} />
                            <Text strong>Количество игроков: </Text>
                            {tournament.players?.length || 0}
                            {tournament.maxAmountOfPlayers && ` / ${tournament.maxAmountOfPlayers}`}
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <Text strong>Создан: </Text>
                            {tournament.createdAt ?
                                dayjs(tournament.createdAt).format('DD.MM.YYYY HH:mm') :
                                'Не указано'}
                        </div>

                        {tournament.minAmountOfPlayers && (
                            <div style={{ marginBottom: 10 }}>
                                <Text strong>Минимальное количество игроков: </Text>
                                {tournament.minAmountOfPlayers}
                            </div>
                        )}

                        {tournament.maxAmountOfPlayers && (
                            <div style={{ marginBottom: 10 }}>
                                <Text strong>Максимальное количество игроков: </Text>
                                {tournament.maxAmountOfPlayers}
                            </div>
                        )}
                    </Card>

                    {/* Список зарегистрированных игроков */}
                    {tournament.players && tournament.players.length > 0 && (
                        <Card title="Зарегистрированные игроки">
                            {tournament.players.map((player, index) => (
                                <div key={index} style={{ marginBottom: 8 }}>
                                    <Text>{player.fullName || 'Неизвестный игрок'}</Text>
                                    {player.rating && (
                                        <Tag color="blue" style={{ marginLeft: 8 }}>
                                            Рейтинг: {player.rating}
                                        </Tag>
                                    )}
                                </div>
                            ))}
                        </Card>
                    )}
                </Col>

                <Col span={8}>
                    <Card title="Действия">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                block
                                onClick={() => window.location.href = `/matches/${tournament.id}`}
                            >
                                Посмотреть матчи
                            </Button>

                            {checkingRegistration ? (
                                <Spin size="small" />
                            ) : isRegistered ? (
                                <Alert
                                    message="Вы уже зарегистрированы"
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
                                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                >
                                    Зарегистрироваться
                                </Button>
                            ) : !isAuthenticated && tournament.stage === 'REGISTRATION' ? (
                                <Button
                                    type="dashed"
                                    block
                                    onClick={() => window.location.href = '/login'}
                                >
                                    Войдите, чтобы зарегистрироваться
                                </Button>
                            ) : tournament.stage !== 'REGISTRATION' ? (
                                <Alert
                                    message="Регистрация закрыта"
                                    type="warning"
                                    showIcon
                                />
                            ) : null}

                            <Button
                                type="default"
                                block
                                onClick={() => window.location.href = '/tournaments'}
                            >
                                Назад к списку
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TournamentDetail;