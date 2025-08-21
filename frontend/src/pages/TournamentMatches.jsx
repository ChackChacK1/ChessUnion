import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Card, Typography, Tag, Spin, message, Pagination } from 'antd';
import { TrophyOutlined, TeamOutlined } from '@ant-design/icons';
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
                    page: page - 1, // Spring Pageable starts from 0
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

    const columns = [
        {
            title: 'Раунд',
            dataIndex: 'roundNumber',
            key: 'roundNumber',
            width: 80,
            align: 'center',
            render: (round) => <Tag color="purple">{round}</Tag>
        },
        {
            title: 'Белые',
            dataIndex: 'whitePlayer',
            key: 'whitePlayer',
            render: (player) => (
                <div>
                    <div>{player?.fullName || 'Неизвестный игрок'}</div>
                    {player?.rating && (
                        <Text type="secondary" small>
                            Рейтинг: {player.rating}
                        </Text>
                    )}
                </div>
            )
        },
        {
            title: 'Результат',
            dataIndex: 'result',
            key: 'result',
            width: 120,
            align: 'center',
            render: (result) => (
                <Tag color={getResultColor(result)}>
                    {getResultText(result)}
                </Tag>
            )
        },
        {
            title: 'Чёрные',
            dataIndex: 'blackPlayer',
            key: 'blackPlayer',
            render: (player) => (
                <div>
                    <div>{player?.fullName || 'Неизвестный игрок'}</div>
                    {player?.rating && (
                        <Text type="secondary" small>
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
            <Title level={2}>
                <TrophyOutlined style={{ marginRight: 12 }} />
                Матчи турнира
            </Title>

            {tournamentInfo && (
                <Card style={{ marginBottom: 20 }}>
                    <Title level={4}>{tournamentInfo.name}</Title>
                    <Text>{tournamentInfo.description}</Text>
                    <div style={{ marginTop: 10 }}>
                        <TeamOutlined style={{ marginRight: 8 }} />
                        <Text type="secondary">
                            Стадия: {tournamentInfo.stage} •
                            Раунд: {tournamentInfo.currentRound} •
                            Игроков: {tournamentInfo.players?.length || 0}
                        </Text>
                    </div>
                </Card>
            )}

            <Card>
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
                <button
                    onClick={() => window.history.back()}
                    style={{ padding: '8px 16px', cursor: 'pointer' }}
                >
                    ← Назад к турниру
                </button>
            </div>
        </div>
    );
};

export default TournamentMatches;