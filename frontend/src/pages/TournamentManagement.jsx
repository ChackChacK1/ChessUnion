import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, List, Typography, Button, message, Spin, Dropdown, Space, Tag, Modal } from 'antd';
import { DownOutlined, ArrowRightOutlined, PlayCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import client from '../api/client';

const { Title, Text } = Typography;

const TournamentManagement = () => {
    const { tournamentId, roundId } = useParams();
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [tournamentInfo, setTournamentInfo] = useState(null);
    const [localResults, setLocalResults] = useState({}); // Хранение локальных результатов
    const [isRollbackModalVisible, setIsRollbackModalVisible] = useState(false);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/api/match/byTournament/${tournamentId}/${roundId}`);
            setMatches(response.data);

            const tournamentResponse = await client.get(`/api/tournament/${tournamentId}`);
            setTournamentInfo(tournamentResponse.data);

            // Сбрасываем локальные результаты при загрузке новых матчей
            setLocalResults({});
        } catch (error) {
            message.error('Ошибка загрузки матчей: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [tournamentId, roundId]);

    const setLocalMatchResult = (matchId, result) => {
        setLocalResults(prev => ({
            ...prev,
            [matchId]: result
        }));
    };

    const saveAllResults = async () => {
        try {
            setUpdating(true);

            // Формируем массив результатов для отправки
            const resultsToSave = Object.entries(localResults).map(([matchId, result]) => ({
                id: parseInt(matchId),
                result: result
            }));

            if (resultsToSave.length > 0) {
                await client.patch(`/api/admin/match/setResults`, resultsToSave);
                message.success(`Сохранено ${resultsToSave.length} результатов!`);
                setLocalResults({}); // Очищаем локальные результаты после успешного сохранения
            }

            return true;
        } catch (error) {
            message.error('Ошибка сохранения результатов: ' + error.response?.data?.message || error.message);
            return false;
        } finally {
            setUpdating(false);
        }
    };

    const createNextRound = async () => {
        // Сначала сохраняем все результаты
        const success = await saveAllResults();
        if (!success) return;

        try {
            setUpdating(true);
            const response = await client.post(`/api/admin/tournament/${tournamentId}/round`);
            const newRound = response.data;
            message.success(`Раунд ${newRound} создан!`);
            navigate(`/admin/tournament/${tournamentId}/${newRound}`);
        } catch (error) {
            message.error('Ошибка создания раунда: ' + error.response?.data?.message || error.message);
        } finally {
            setUpdating(false);
        }
    };

    const endTournament = async () => {
        // Сначала сохраняем все результаты
        const success = await saveAllResults();
        if (!success) return;

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

    const rollbackRound = async () => {
        try {
            setUpdating(true);
            await client.patch(`/api/admin/tournament/${tournamentId}/rollback`);
            message.success('Откат к предыдущему раунду выполнен!');
            navigate(`/admin/tournament/${tournamentId}/${parseInt(roundId) - 1}`);
        } catch (error) {
            message.error('Ошибка отката: ' + error.response?.data?.message || error.message);
        } finally {
            setUpdating(false);
            setIsRollbackModalVisible(false);
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

    const showRollbackConfirm = () => {
        setIsRollbackModalVisible(true);
    };

    const hideRollbackConfirm = () => {
        setIsRollbackModalVisible(false);
    };

    const isFirstRoundAndNotStarted = () => {
        return parseInt(roundId) === 0 && matches.length === 0;
    };

    const isLastRound = () => {
        return tournamentInfo && parseInt(roundId) === tournamentInfo.amountOfRounds;
    };

    const canChangeResult = (match) => {
        // Можно менять если: либо нет результата в БД, либо есть локальный результат
        return match.result === null || localResults[match.id] !== undefined;
    };

    const hasLocalResult = (matchId) => {
        return localResults[matchId] !== undefined;
    };

    const canCreateNextRound = () => {
        // Проверяем, что все матчи имеют результат (либо в БД, либо локально)
        return !matches.some(match => {
            const hasDbResult = match.result !== null;
            const hasLocalResult = localResults[match.id] !== undefined;
            return !hasDbResult && !hasLocalResult;
        });
    };

    const hasUnsavedChanges = () => {
        return Object.keys(localResults).length > 0;
    };

    const getResultMenu = (match) => {
        const items = [
            {
                key: '1',
                label: 'Победа белых',
                onClick: () => setLocalMatchResult(match.id, 1.0)
            },
            {
                key: '0.5',
                label: 'Ничья',
                onClick: () => setLocalMatchResult(match.id, 0.5)
            },
            {
                key: '0',
                label: 'Победа чёрных',
                onClick: () => setLocalMatchResult(match.id, 0.0)
            }
        ];

        // Добавляем сброс только если результат уже выбран
        if (getDisplayResult(match) !== null) {
            items.push({
                key: 'reset',
                label: 'Сбросить результат',
                onClick: () => setLocalMatchResult(match.id, null)
            });
        }

        return items;
    };

    const getDisplayResult = (match) => {
        // Возвращаем локальный результат если есть, иначе результат из БД
        return localResults[match.id] !== undefined ? localResults[match.id] : match.result;
    };

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

            {/* Кнопка отката (только для стадии PLAYING и не первого раунда) */}
            {tournamentInfo?.stage === 'PLAYING' && parseInt(roundId) > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <Button
                        type="primary"
                        danger
                        icon={<RollbackOutlined />}
                        onClick={showRollbackConfirm}
                        loading={updating}
                        style={{
                            marginRight: 10
                        }}
                    >
                        { (parseInt(roundId) === 1)
                            ? "Вернуться на стадию регистрации"
                            : "Откатиться к предыдущему раунду"
                        }
                    </Button>


                    {hasUnsavedChanges() && (
                        <Tag color="orange" style={{ marginLeft: 10 }}>
                            Есть несохранённые изменения: {Object.keys(localResults).length}
                        </Tag>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text strong style={{ color: 'var(--text-color)' }}>Раунд: {parseInt(roundId)}</Text>

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
                        renderItem={(match) => {
                            const displayResult = getDisplayResult(match);
                            const hasLocalResult = localResults[match.id] !== undefined;

                            return (
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
                                            {displayResult !== null ? (
                                                <Dropdown
                                                    menu={{ items: getResultMenu(match) }}
                                                    trigger={['click']}
                                                    disabled={!canChangeResult(match) || updating}
                                                >
                                                    <Space direction="vertical" size="small">
                                                        <Tag
                                                            color={getResultColor(displayResult)}
                                                            style={{
                                                                margin: 0,
                                                                color: 'var(--text-color)',
                                                                borderColor: 'var(--border-color)',
                                                                borderStyle: hasLocalResult ? 'dashed' : 'solid',
                                                                cursor: canChangeResult(match) ? 'pointer' : 'default'
                                                            }}
                                                        >
                                                            {getResultText(displayResult)}
                                                            {hasLocalResult && ' *'}
                                                        </Tag>
                                                        {hasLocalResult && (
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                Не сохранено
                                                            </Text>
                                                        )}
                                                    </Space>
                                                </Dropdown>
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
                                                            color: '#4a4a4a',
                                                            borderColor: '#404040'
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
                            );
                        }}
                    />
                ) : (
                    <Text style={{ color: 'var(--text-secondary)' }}>Матчей в этом раунде пока нет</Text>
                )}
            </Card>

            {/* Модальное окно подтверждения отката */}
            <Modal
                title="Подтверждение отката"
                open={isRollbackModalVisible}
                onOk={rollbackRound}
                onCancel={hideRollbackConfirm}
                okText="Да, откатиться"
                cancelText="Отмена"
                okType="danger"
                confirmLoading={updating}
            >
                <p>Вы уверены, что хотите откатиться к предыдущему раунду?</p>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Это действие невозможно отменить. Все матчи текущего раунда и результаты матчей предыдущего будут потеряны.
                </p>
            </Modal>
        </div>
    );
};

export default TournamentManagement;