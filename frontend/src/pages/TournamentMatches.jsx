import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Table, Card, Typography, Tag, Spin, message, Pagination, Button, Space } from 'antd';
import { TrophyOutlined, TeamOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TournamentMatches = () => {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1); // UI page (1-based)
    const [pageSize] = useState(10);

    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [tournamentInfo, setTournamentInfo] = useState(null);

    const goBack = () => {
        const from = location.state?.from;
        if (from) navigate(from, { replace: true });
        else navigate(-1);
    };

    const getResultText = (result) => {
        if (result === null || result === undefined) return 'Ещё не сыграно';
        if (result === 1) return '1-0';
        if (result === 0) return '0-1';
        if (result === 0.5) return '½-½';
        return String(result);
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
            ANNOUNCED: 'blue',
            REGISTRATION: 'green',
            IN_PROGRESS: 'orange',
            FINISHED: 'red',
            CANCELLED: 'gray',
        };
        return colors[stage] || 'default';
    };

    const translateStage = (stage) => {
        const translations = {
            ANNOUNCED: 'Анонсирован',
            REGISTRATION: 'Регистрация',
            IN_PROGRESS: 'В процессе',
            FINISHED: 'Завершен',
            CANCELLED: 'Отменен',
        };
        return translations[stage] || stage;
    };

    const columns = useMemo(
        () => [
            {
                title: <span style={{ color: 'var(--text-color)' }}>Раунд</span>,
                dataIndex: 'roundNumber',
                key: 'roundNumber',
                width: 90,
                align: 'center',
                render: (round) => (
                    <Tag
                        color="purple"
                        style={{
                            color: 'var(--text-color)',
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)',
                        }}
                    >
                        {round}
                    </Tag>
                ),
            },
            {
                title: <span style={{ color: 'var(--text-color)' }}>Белые</span>,
                dataIndex: 'whitePlayer',
                key: 'whitePlayer',
                render: (player) => (
                    <div>
                        <div style={{ color: 'var(--text-color)', fontWeight: 600 }}>
                            {player?.fullName || 'Неизвестный игрок'}
                        </div>
                        {player?.rating !== null && player?.rating !== undefined && (
                            <Text style={{ color: 'var(--text-secondary)' }}>Рейтинг: {player.rating}</Text>
                        )}
                    </div>
                ),
            },
            {
                title: <span style={{ color: 'var(--text-color)' }}>Результат</span>,
                dataIndex: 'result',
                key: 'result',
                width: 140,
                align: 'center',
                render: (result) => (
                    <Tag
                        color={getResultColor(result)}
                        style={{
                            color: 'var(--text-color)',
                            borderColor: 'var(--border-color)',
                            fontWeight: 700,
                            padding: '2px 10px',
                        }}
                    >
                        {getResultText(result)}
                    </Tag>
                ),
            },
            {
                title: <span style={{ color: 'var(--text-color)' }}>Чёрные</span>,
                dataIndex: 'blackPlayer',
                key: 'blackPlayer',
                render: (player) => (
                    <div>
                        <div style={{ color: 'var(--text-color)', fontWeight: 600 }}>
                            {player?.fullName || 'Неизвестный игрок'}
                        </div>
                        {player?.rating !== null && player?.rating !== undefined && (
                            <Text style={{ color: 'var(--text-secondary)' }}>Рейтинг: {player.rating}</Text>
                        )}
                    </div>
                ),
            },
        ],
        []
    );

    const fetchTournamentInfo = async () => {
        try {
            const response = await client.get(`/api/tournament/${tournamentId}`);
            const data = response?.data?.body?.id ? response.data.body : response.data;
            setTournamentInfo(data);
        } catch (error) {
            console.error('Ошибка загрузки информации о турнире:', error);
        }
    };

    const fetchMatches = async (page, size) => {
        try {
            setLoading(true);

            const response = await client.get(`/api/match/byTournament/${tournamentId}`, {
                params: { page: page - 1, size },
            });

            // матчевый эндпоинт возвращает Page (как в твоём JSON)
            const pageData = response?.data?.body?.content ? response.data.body : response.data;

            const content = Array.isArray(pageData?.content) ? pageData.content : [];
            setMatches(content);

            setTotalPages(pageData?.totalPages ?? 0);
            setTotalElements(pageData?.totalElements ?? 0);
        } catch (error) {
            message.error('Ошибка загрузки матчей: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!tournamentId) return;
        fetchTournamentInfo();
    }, [tournamentId]);

    useEffect(() => {
        if (!tournamentId) return;
        fetchMatches(currentPage, pageSize);
    }, [tournamentId, currentPage, pageSize]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading && matches.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Spin size="large" />
                <Text style={{ marginLeft: 10, color: 'var(--text-color)' }}>Загрузка матчей...</Text>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <Space align="center" style={{ marginBottom: 10 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={goBack}
                    style={{
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                    }}
                >
                    Назад
                </Button>

                <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
                    <TrophyOutlined style={{ marginRight: 12, color: '#ffffff' }} />
                    Матчи турнира
                </Title>
            </Space>

            {tournamentInfo && (
                <Card
                    style={{
                        marginBottom: 20,
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)',
                    }}
                >
                    <Title level={4} style={{ color: 'var(--text-color)', marginBottom: 6 }}>
                        {tournamentInfo.name}
                    </Title>

                    {tournamentInfo.description && (
                        <Text style={{ color: 'var(--text-color)' }}>{tournamentInfo.description}</Text>
                    )}

                    <div style={{ marginTop: 10 }}>
                        <TeamOutlined style={{ marginRight: 8, color: 'var(--text-secondary)' }} />
                        <Text style={{ color: 'var(--text-secondary)' }}>
                            Стадия:{' '}
                            <Tag color={getStageColor(tournamentInfo.stage)} style={{ marginLeft: 6, marginRight: 6 }}>
                                {translateStage(tournamentInfo.stage)}
                            </Tag>
                            • Раунд: {typeof tournamentInfo.currentRound === 'number' ? tournamentInfo.currentRound + 1 : '—'} •
                            Игроков: {tournamentInfo.players?.length || 0}
                            {tournamentInfo.startDateTime && (
                                <>
                                    {' '}
                                    • Старт: {dayjs(tournamentInfo.startDateTime).format('DD.MM.YYYY HH:mm')}
                                </>
                            )}
                        </Text>
                    </div>
                </Card>
            )}

            <Card
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                }}
            >
                <Table
                    columns={columns}
                    dataSource={matches.map((match) => ({ ...match, key: match.id }))}
                    loading={loading}
                    pagination={false}
                    locale={{ emptyText: 'Матчи пока не созданы' }}
                />

                {(
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20}}>
                        <Pagination
                            style={{color: 'var(--text-color)'}}
                            current={currentPage}
                            pageSize={pageSize}
                            total={totalElements}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                            showTotal={(total, range) => `Показано ${range[0]}-${range[1]} из ${total}`}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TournamentMatches;