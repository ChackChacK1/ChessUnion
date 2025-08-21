import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Tag, Spin, message, Button, Row, Col, Space } from 'antd';
import { CalendarOutlined, TrophyOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const TournamentDetail = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        fetchTournament();
        checkAuth();
    }, [id]);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    };

    const fetchTournament = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/api/tournament/${id}`);
            setTournament(response.data);
        } catch (error) {
            message.error('Ошибка загрузки турнира: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistration = async () => {
        try {
            setRegistering(true);
            await client.put(`/api/tournament/${id}/registration`);
            message.success('Вы успешно зарегистрировались на турнир!');
            // Обновляем данные турнира после регистрации
            fetchTournament();
        } catch (error) {
            message.error('Ошибка регистрации: ' + error.response?.data?.message || error.message);
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

    const canRegister = () => {
        if (!isAuthenticated) return false;
        if (tournament.stage !== 'REGISTRATION') return false;
        if (tournament.maxAmountOfPlayers && tournament.players?.length >= tournament.maxAmountOfPlayers) return false;
        return true;
    };

    const isUserRegistered = () => {
        // Здесь можно добавить проверку, зарегистрирован ли уже пользователь
        // Пока просто возвращаем false, можно доработать когда будет endpoint для проверки
        return false;
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    if (!tournament) {
        return <Text>Турнир не найден</Text>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Title level={2}>{tournament.name}</Title>

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
                            {dayjs(tournament.startDateTime).format('DD.MM.YYYY HH:mm')}
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <TrophyOutlined style={{ marginRight: 8 }} />
                            <Text strong>Стадия: </Text>
                            <Tag color={getStageColor(tournament.stage)}>
                                {tournament.stage}
                            </Tag>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <TeamOutlined style={{ marginRight: 8 }} />
                            <Text strong>Количество игроков: </Text>
                            {tournament.players?.length || 0}
                            {tournament.maxAmountOfPlayers && ` / ${tournament.maxAmountOfPlayers}`}
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <Text strong>Текущий раунд: </Text>
                            {tournament.currentRound}
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <Text strong>Создан: </Text>
                            {dayjs(tournament.createdAt).format('DD.MM.YYYY HH:mm')}
                        </div>

                        {tournament.minAmountOfPlayers && (
                            <div style={{ marginBottom: 10 }}>
                                <Text strong>Минимальное количество игроков: </Text>
                                {tournament.minAmountOfPlayers}
                            </div>
                        )}
                    </Card>
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

                            {canRegister() && !isUserRegistered() && (
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
                            )}

                            {isUserRegistered() && (
                                <Button
                                    type="default"
                                    block
                                    disabled
                                >
                                    Вы уже зарегистрированы
                                </Button>
                            )}

                            {!isAuthenticated && tournament.stage === 'REGISTRATION' && (
                                <Button
                                    type="dashed"
                                    block
                                    onClick={() => window.location.href = '/login'}
                                >
                                    Войдите, чтобы зарегистрироваться
                                </Button>
                            )}

                            {tournament.stage !== 'REGISTRATION' && (
                                <Button
                                    type="default"
                                    block
                                    disabled
                                >
                                    Регистрация закрыта
                                </Button>
                            )}

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