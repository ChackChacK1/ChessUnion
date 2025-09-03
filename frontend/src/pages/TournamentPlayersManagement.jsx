import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Card, Typography, Button, message, Spin, Space, Tag } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, TeamOutlined } from '@ant-design/icons';
import client from '../api/client';

const { Title, Text } = Typography;

const TournamentPlayersManagement = () => {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tournamentInfo, setTournamentInfo] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Функции для получения цвета и перевода стадии
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

    useEffect(() => {
        fetchTournamentInfo();
        fetchPlayers();
    }, [tournamentId]);

    const fetchTournamentInfo = async () => {
        try {
            const response = await client.get(`/api/tournament/${tournamentId}`);
            const tournamentData = response.data.body || response.data;
            setTournamentInfo(tournamentData);
        } catch (error) {
            console.error('Ошибка загрузки информации о турнире:', error);
        }
    };

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/api/admin/player/tournament/${tournamentId}`);
            const playersData = response.data.body || response.data;
            setPlayers(Array.isArray(playersData) ? playersData : []);
        } catch (error) {
            message.error('Ошибка загрузки игроков: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePlayer = async (playerId) => {
        try {
            setDeleting(true);
            await client.delete(`/api/admin/player/${playerId}`);
            message.success('Игрок успешно удален из турнира');
            fetchPlayers(); // Обновляем список
        } catch (error) {
            message.error('Ошибка удаления игрока: ' + (error.response?.data?.message || error.message));
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            title: 'Место',
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
            title: 'Игрок',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (name, record) => (
                <div>
                    <Text strong style={{ color: 'var(--text-color)' }}>{name}</Text>
                    {record.rating && (
                        <div>
                            <Text style={{ color: 'var(--text-secondary)' }}>
                                Рейтинг: {record.rating}
                            </Text>
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Очки',
            dataIndex: 'score',
            key: 'score',
            width: 100,
            align: 'center',
            render: (score) => (
                <Tag color="green" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    {score || '0'}
                </Tag>
            )
        },
        {
            title: 'Доп. очки',
            dataIndex: 'secondScore',
            key: 'secondScore',
            width: 120,
            align: 'center',
            render: (secondScore) => (
                <Tag color="orange" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    {secondScore || '0'}
                </Tag>
            )
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Button
                    icon={<DeleteOutlined />}
                    type="primary"
                    danger
                    size="small"
                    loading={deleting}
                    onClick={() => handleRemovePlayer(record.id)}
                    style={{
                        backgroundColor: '#ff4d4f',
                        borderColor: '#ff4d4f'
                    }}
                >
                    Удалить
                </Button>
            )
        }
    ];

    if (loading && players.length === 0) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Space style={{ marginBottom: 20, alignItems: 'center' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin')}
                    style={{ color: 'var(--text-color)' }}
                />
                <Title level={2} style={{ margin: 0, color: 'var(--text-color)' }}>
                    <TeamOutlined style={{ marginRight: 12 }} />
                    Управление игроками
                </Title>
            </Space>

            {tournamentInfo && (
                <Card
                    style={{
                        marginBottom: 20,
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    <Title level={4} style={{ color: 'var(--text-color)', marginBottom: 16 }}>
                        {tournamentInfo.name}
                    </Title>

                    <Space size="middle" style={{ marginBottom: 12 }}>
                        <Text strong style={{ color: 'var(--text-color)' }}>Стадия:</Text>
                        <Tag color={getStageColor(tournamentInfo.stage)} style={{
                            color: 'var(--text-color)',
                            borderColor: 'var(--border-color)'
                        }}>
                            {translateStage(tournamentInfo.stage)}
                        </Tag>
                    </Space>

                    <div>
                        <Text style={{ color: 'var(--text-color)' }}>
                            <Text strong>Раунд:</Text> {tournamentInfo.currentRound + 1} •
                            <Text strong> Игроков:</Text> {players.length}
                        </Text>
                    </div>

                    {tournamentInfo.description && (
                        <div style={{ marginTop: 12 }}>
                            <Text style={{ color: 'var(--text-secondary)' }}>
                                {tournamentInfo.description}
                            </Text>
                        </div>
                    )}
                </Card>
            )}

            <Card
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
            >
                <Table
                    columns={columns}
                    dataSource={players.map(player => ({
                        ...player,
                        key: player.id
                    }))}
                    loading={loading}
                    pagination={false}
                    locale={{
                        emptyText: 'В турнире пока нет игроков'
                    }}
                />

                {players.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        <TeamOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                        <div>Нет зарегистрированных игроков</div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TournamentPlayersManagement;