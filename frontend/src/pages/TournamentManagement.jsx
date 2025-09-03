import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, List, Typography, Button, message, Spin, Dropdown, Space, Tag } from 'antd';
import { DownOutlined, ArrowRightOutlined, PlayCircleOutlined } from '@ant-design/icons';
import client from '../api/client';

const { Title, Text } = Typography;

const TournamentManagement = () => {
    const { tournamentId, roundId } = useParams();
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [tournamentInfo, setTournamentInfo] = useState(null);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/api/match/byTournament/${tournamentId}/${roundId}`);
            setMatches(response.data);

            const tournamentResponse = await client.get(`/api/tournament/${tournamentId}`);
            setTournamentInfo(tournamentResponse.data);
        } catch (error) {
            message.error('Ошибка загрузки матчей: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [tournamentId, roundId]);

    const setMatchResult = async (matchId, result) => {
        try {
            setUpdating(true);
            await client.patch(`/api/admin/match/${matchId}/setResult`, { result });
            message.success('Результат установлен!');
            fetchMatches();
        } catch (error) {
            message.error('Ошибка установки результата: ' + error.response?.data?.message || error.message);
        } finally {
            setUpdating(false);
        }
    };

    const createNextRound = async () => {
        try {
            setUpdating(true);
            const response = await client.post(`/api/admin/tournament/${tournamentId}/round`);
            const newRound = response.data;
            message.success(`Раунд ${newRound + 1} создан!`);
            navigate(`/admin/tournament/${tournamentId}/${newRound}`);
        } catch (error) {
            message.error('Ошибка создания раунда: ' + error.response?.data?.message || error.message);
        } finally {
            setUpdating(false);
        }
    };

    const endTournament = async () => {
        try {
            setUpdating(true);
            await client.post(`/api/admin/tournament/${tournamentId}/round`);
            message.success(`Турнир завершен!`);
            navigate(`/tournament/${tournamentId}`);
        } catch (error) {
            message.error('Ошибка завершения турнира: ' + error.response?.data?.message || error.message);
        } finally {
            setUpdating(false);
        }
    };

    const startTournamentDraw = async () => {
        try {
            setUpdating(true);
            const response = await client.post(`/api/admin/tournament/${tournamentId}/round`);
            const newRound = response.data;
            message.success('Жеребьевка проведена! Турнир начат.');
            navigate(`/admin/tournament/${tournamentId}/${newRound}`);
        } catch (error) {
            message.error('Ошибка жеребьевки: ' + error.response?.data?.message || error.message);
        } finally {
            setUpdating(false);
        }
    };

    const isFirstRoundAndNotStarted = () => {
        return parseInt(roundId) === 0 && matches.length === 0;
    };

    const isLastRound = () => {
        return tournamentInfo && parseInt(roundId) === tournamentInfo.amountOfRounds - 1;
    };

    const canCreateNextRound = () => {
        return !matches.some(match => match.result === null);
    };

    const getResultMenu = (match) => [
        {
            key: '1',
            label: 'Победа белых',
            onClick: () => setMatchResult(match.id, 1.0)
        },
        {
            key: '0.5',
            label: 'Ничья',
            onClick: () => setMatchResult(match.id, 0.5)
        },
        {
            key: '0',
            label: 'Победа чёрных',
            onClick: () => setMatchResult(match.id, 0.0)
        }
    ];

    const getResultText = (result) => {
        switch (result) {
            case 1: return '1-0';
            case 0: return '0-1';
            case 0.5: return '½-½';
            default: return 'Не завершён';
        }
    };

    const getResultColor = (result) => {
        switch (result) {
            case 1: return 'green';
            case 0: return 'red';
            case 0.5: return 'blue';
            default: return 'gray';
        }
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Title level={2} style={{ color: 'var(--text-color)' }}>
                Управление турниром: {tournamentInfo?.name || `ID: ${tournamentId}`}
            </Title>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text strong style={{ color: 'var(--text-color)' }}>Раунд: {parseInt(roundId) + 1}</Text>

                {isFirstRoundAndNotStarted() ? (
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={startTournamentDraw}
                        loading={updating}
                        style={{
                            backgroundColor: 'var(--hover-color)',
                            borderColor: 'var(--hover-color)'
                        }}
                    >
                        Начать жеребьевку
                    </Button>
                ) : (
                    isLastRound() ? (
                        <Button
                            type="primary"
                            onClick={endTournament}
                            loading={updating}
                            disabled={!canCreateNextRound()}
                            style={{
                                backgroundColor: 'var(--hover-color)',
                                borderColor: 'var(--hover-color)'
                            }}
                        >
                            Завершить турнир
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            onClick={createNextRound}
                            loading={updating}
                            disabled={!canCreateNextRound()}
                            style={{
                                backgroundColor: 'var(--hover-color)',
                                borderColor: 'var(--hover-color)'
                            }}
                        >
                            Следующий раунд
                        </Button>
                    )
                )}
            </div>

            <Card
                title={<span style={{ color: 'var(--text-color)' }}>Матчи раунда</span>}
                bordered={false}
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
            >
                {/* Заголовки колонок */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr auto 1fr',
                    gap: '16px',
                    padding: '16px',
                    fontWeight: 'bold',
                    borderBottom: '2px solid var(--border-color)',
                    color: 'var(--text-color)'
                }}>
                    <span>ID</span>
                    <span>Белые</span>
                    <span>Результат</span>
                    <span>Чёрные</span>
                </div>

                {matches.length > 0 ? (
                    <List
                        dataSource={matches}
                        renderItem={(match) => (
                            <List.Item style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '60px 1fr auto 1fr',
                                    gap: '16px',
                                    alignItems: 'center',
                                    width: '100%',
                                    padding: '12px'
                                }}>
                                    {/* ID матча */}
                                    <Text strong style={{ color: 'var(--text-color)' }}>#{match.id}</Text>

                                    {/* Белые */}
                                    <div style={{ textAlign: 'center' }}>
                                        <Text strong style={{ color: 'var(--text-color)' }}>
                                            {match.whitePlayer?.fullName}
                                        </Text>
                                        <div>
                                            <Text style={{ color: 'var(--text-secondary)' }}>
                                                ({match.whitePlayer?.score})
                                            </Text>
                                        </div>
                                    </div>

                                    {/* Результат */}
                                    <div style={{ textAlign: 'center' }}>
                                        {match.result !== null ? (
                                            <Tag
                                                color={getResultColor(match.result)}
                                                style={{
                                                    margin: 0,
                                                    color: 'var(--text-color)',
                                                    borderColor: 'var(--border-color)'
                                                }}
                                            >
                                                {getResultText(match.result)}
                                            </Tag>
                                        ) : (
                                            <Dropdown
                                                menu={{ items: getResultMenu(match) }}
                                                trigger={['click']}
                                                disabled={updating}
                                            >
                                                <Button
                                                    type="dashed"
                                                    loading={updating}
                                                    style={{
                                                        color: 'var(--text-color)',
                                                        borderColor: 'var(--border-color)'
                                                    }}
                                                >
                                                    Выбрать результат <DownOutlined />
                                                </Button>
                                            </Dropdown>
                                        )}
                                    </div>

                                    {/* Чёрные */}
                                    <div style={{ textAlign: 'center' }}>
                                        <Text strong style={{ color: 'var(--text-color)' }}>
                                            {match.blackPlayer?.fullName}
                                        </Text>
                                        <div>
                                            <Text style={{ color: 'var(--text-secondary)' }}>
                                                ({match.blackPlayer?.score})
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text style={{ color: 'var(--text-secondary)' }}>Матчей в этом раунде пока нет</Text>
                )}
            </Card>
        </div>
    );
};

export default TournamentManagement;