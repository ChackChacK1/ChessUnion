import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Table,
    Card,
    Typography,
    Button,
    message,
    Spin,
    Space,
    Tag,
    Grid,
    Input,
    Row,
    Col
} from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import client from '../api/client';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const TournamentPlayersManagement = () => {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tournamentInfo, setTournamentInfo] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [addingPlayer, setAddingPlayer] = useState(false);
    const [fullName, setFullName] = useState('');

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

    const handleAddPlayer = async () => {
        if (!fullName.trim()) {
            message.warning('Введите Фамилию и Имя игрока');
            return;
        }

        try {
            setAddingPlayer(true);
            await client.post(`/api/admin/tournament/${tournamentId}/addUser`, {
                fullName: fullName.trim()
            });
            message.success('Игрок успешно добавлен в турнир');
            setFullName(''); // Очищаем поле ввода
            fetchPlayers(); // Обновляем список игроков
        } catch (error) {
            message.error('Ошибка добавления игрока: ' + (error.response?.data?.message || error.message));
        } finally {
            setAddingPlayer(false);
        }
    };

    const columns = [
        {
            title: 'Игрок',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (name, record) => (
                <div>
                    <Text strong style={{ color: 'var(--text-color)', fontSize: isMobile ? '14px' : '16px' }}>
                        {name}
                    </Text>
                    {record.rating && (
                        <div>
                            <Text style={{
                                color: 'var(--text-secondary)',
                                fontSize: isMobile ? '12px' : '14px'
                            }}>
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
            width: isMobile ? 60 : 80,
            align: 'center',
            render: (score) => (
                <Tag color="green" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)',
                    fontSize: isMobile ? '12px' : '14px',
                    margin: isMobile ? '2px 0' : '0'
                }}>
                    {score || '0'}
                </Tag>
            )
        },
        {
            title: isMobile ? 'Доп.' : 'Доп. очки',
            dataIndex: 'secondScore',
            key: 'secondScore',
            width: isMobile ? 60 : 80,
            align: 'center',
            render: (secondScore) => (
                <Tag color="orange" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)',
                    fontSize: isMobile ? '12px' : '14px',
                    margin: isMobile ? '2px 0' : '0'
                }}>
                    {secondScore || '0'}
                </Tag>
            )
        },
        {
            title: 'Действия',
            key: 'actions',
            width: isMobile ? 80 : 100,
            align: 'center',
            render: (_, record) => (
                <Button
                    icon={<DeleteOutlined />}
                    type="primary"
                    danger
                    size={isMobile ? "small" : "middle"}
                    loading={deleting}
                    onClick={() => handleRemovePlayer(record.id)}
                    style={{
                        backgroundColor: '#ff4d4f',
                        borderColor: '#ff4d4f',
                        fontSize: isMobile ? '12px' : '14px'
                    }}
                >
                    {isMobile ? '' : 'Удалить'}
                </Button>
            )
        }
    ];

    if (loading && players.length === 0) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    return (
        <div style={{ padding: isMobile ? '12px' : '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Space style={{ marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin')}
                    style={{ color: 'var(--text-color)' }}
                    size={isMobile ? "small" : "middle"}
                />
                <Title level={isMobile ? 3 : 2} style={{ margin: 0, color: 'var(--text-color)' }}>
                    <TeamOutlined style={{ marginRight: 12 }} />
                    {isMobile ? 'Игроки' : 'Управление игроками'}
                </Title>
            </Space>

            {tournamentInfo && (
                <Card
                    style={{
                        marginBottom: 20,
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                    bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
                >
                    <Title level={isMobile ? 5 : 4} style={{ color: 'var(--text-color)', marginBottom: 12 }}>
                        {tournamentInfo.name}
                    </Title>

                    <Space size="middle" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
                        <Text strong style={{ color: 'var(--text-color)', fontSize: isMobile ? '13px' : '14px' }}>
                            Стадия:
                        </Text>
                        <Tag color={getStageColor(tournamentInfo.stage)} style={{
                            color: 'var(--text-color)',
                            borderColor: 'var(--border-color)',
                            fontSize: isMobile ? '12px' : '14px'
                        }}>
                            {translateStage(tournamentInfo.stage)}
                        </Tag>
                    </Space>

                    <div style={{ marginBottom: 8 }}>
                        <Text style={{
                            color: 'var(--text-color)',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            <Text strong>Раунд:</Text> {tournamentInfo.currentRound + 1} •{' '}
                            <Text strong>Игроков:</Text> {players.length}
                        </Text>
                    </div>

                    {tournamentInfo.description && (
                        <div style={{ marginTop: 8 }}>
                            <Text style={{
                                color: 'var(--text-secondary)',
                                fontSize: isMobile ? '12px' : '14px'
                            }}>
                                {tournamentInfo.description.length > 100 && isMobile
                                    ? `${tournamentInfo.description.substring(0, 100)}...`
                                    : tournamentInfo.description
                                }
                            </Text>
                        </div>
                    )}
                </Card>
            )}

            {/* Поле для добавления нового игрока */}
            <Card
                style={{
                    marginBottom: 20,
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
                bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
            >
                <Title level={isMobile ? 5 : 4} style={{ color: 'var(--text-color)', marginBottom: 16 }}>
                    Добавить игрока
                </Title>

                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={16}>
                        <Input
                            placeholder="Введите Фамилию и Имя (например: Иванов Иван)"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            onPressEnter={handleAddPlayer}
                            disabled={addingPlayer}
                            size={isMobile ? "small" : "middle"}
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-color)'
                            }}
                        />
                    </Col>
                    <Col xs={24} md={8}>
                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            loading={addingPlayer}
                            onClick={handleAddPlayer}
                            size={isMobile ? "small" : "middle"}
                            style={{ width: isMobile ? '100%' : 'auto' }}
                        >
                            Добавить игрока
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
                bodyStyle={{ padding: isMobile ? '8px' : '16px' }}
            >
                {players.length > 0 ? (
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
                        size={isMobile ? "small" : "middle"}
                        scroll={isMobile ? { x: 300 } : undefined}
                    />
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: 'var(--text-secondary)'
                    }}>
                        <TeamOutlined style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--text-secondary)' }} />
                        <div style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            Нет зарегистрированных игроков
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TournamentPlayersManagement;