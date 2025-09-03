import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Card, Typography, Tag, Spin, message, Pagination, Button } from 'antd';
import { TrophyOutlined, TeamOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TournamentMatches = () => {
    const { tournamentId } = useParams();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [tournamentInfo, setTournamentInfo] = useState(null);

    useEffect(() => {
        fetchTournamentInfo();
        fetchMatches(currentPage, pageSize);
    }, [tournamentId, currentPage, pageSize]);

    const fetchTournamentInfo = async () => {
        try {
            const response = await client.get(`/api/tournament/${tournamentId}`);
            setTournamentInfo(response.data.body || response.data);
        } catch (error) {
            console.error('Ошибка загрузки информации о турнире:', error);
        }
    };

    const fetchMatches = async (page, size) => {
        try {
            setLoading(true);
            const response = await client.get(`/api/match/byTournament/${tournamentId}`, {
                params: {
                    page: page - 1,
                    size: size
                }
            });

            const matchesData = response.data.body || response.data;
            setMatches(Array.isArray(matchesData) ? matchesData : []);
            setTotalPages(response.data.totalPages || 1);

        } catch (error) {
            message.error('Ошибка загрузки матчей: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const getResultText = (result) => {
        if (result === null || result === undefined) return 'Ещё не сыграно';
        if (result === 1) return '1-0';
        if (result === 0) return '0-1';
        if (result === 0.5) return '½-½';
        return result;
    };

    const getResultColor = (result) => {
        if (result === null || result === undefined) return 'default';
        if (result === 1) return 'green';
        if (result === 0) return 'red';
        if (result === 0.5) return 'blue';
        return 'default';
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

    const columns = [
        {
            title: <span style={{ color: 'var(--text-color)' }}>Раунд</span>,
            dataIndex: 'roundNumber',
            key: 'roundNumber',
            width: 80,
            align: 'center',
            render: (round) => (
                <Tag
                    color="purple"
                    style={{
                        color: 'var(--text-color)',
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    {round}
                </Tag>
            )
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Белые</span>,
            dataIndex: 'whitePlayer',
            key: 'whitePlayer',
            render: (player) => (
                <div>
                    <div style={{ color: 'var(--text-color)' }}>
                        {player?.fullName || 'Неизвестный игрок'}
                    </div>
                    {player?.rating && (
                        <Text style={{ color: 'var(--text-secondary)' }}>
                            Рейтинг: {player.rating}
                        </Text>
                    )}
                </div>
            )
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Результат</span>,
            dataIndex: 'result',
            key: 'result',
            width: 120,
            align: 'center',
            render: (result) => (
                <Tag
                    color={getResultColor(result)}
                    style={{
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    {getResultText(result)}
                </Tag>
            )
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Чёрные</span>,
            dataIndex: 'blackPlayer',
            key: 'blackPlayer',
            render: (player) => (
                <div>
                    <div style={{ color: 'var(--text-color)' }}>
                        {player?.fullName || 'Неизвестный игрок'}
                    </div>
                    {player?.rating && (
                        <Text style={{ color: 'var(--text-secondary)' }}>
                            Рейтинг: {player.rating}
                        </Text>
                    )}
                </div>
            )
        }
    ];

    if (loading && matches.length === 0) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2} style={{ color: 'var(--text-color)' }}>
                <TrophyOutlined style={{ marginRight: 12, color: 'var(--text-color)' }} />
                Матчи турнира
            </Title>

            {tournamentInfo && (
                <Card
                    style={{
                        marginBottom: 20,
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    <Title level={4} style={{ color: 'var(--text-color)' }}>
                        {tournamentInfo.name}
                    </Title>
                    {tournamentInfo.description && (
                        <Text style={{ color: 'var(--text-color)' }}>
                            {tournamentInfo.description}
                        </Text>
                    )}
                    <div style={{ marginTop: 10 }}>
                        <TeamOutlined style={{ marginRight: 8, color: 'var(--text-secondary)' }} />
                        <Text style={{ color: 'var(--text-secondary)' }}>
                            Стадия: <Tag color={getStageColor(tournamentInfo.stage)}>
                            {translateStage(tournamentInfo.stage)}
                        </Tag> •
                            Раунд: {tournamentInfo.currentRound + 1} •
                            Игроков: {tournamentInfo.players?.length || 0}
                        </Text>
                    </div>
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
                    dataSource={matches.map(match => ({
                        ...match,
                        key: match.id
                    }))}
                    loading={loading}
                    pagination={false}
                    locale={{
                        emptyText: 'Матчи пока не созданы'
                    }}
                />

                {totalPages > 1 && (
                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={totalPages * pageSize}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                            showQuickJumper
                        />
                    </div>
                )}
            </Card>

            <div style={{ marginTop: 20 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => window.history.back()}
                    style={{
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    Назад к турниру
                </Button>
            </div>
        </div>
    );
};

export default TournamentMatches;