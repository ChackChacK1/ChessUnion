import { useState, useEffect } from 'react';
import { Table, Card, Typography, Spin, message, Tag } from 'antd';
import { CrownOutlined, TrophyOutlined, StarFilled } from '@ant-design/icons';
import client from '../api/client';

const { Title, Text } = Typography;

const TopPlayers = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopPlayers();
    }, []);

    const fetchTopPlayers = async () => {
        try {
            setLoading(true);
            const response = await client.get('/api/user/top');
            const playersData = response.data;
            setPlayers(Array.isArray(playersData) ? playersData : []);
        } catch (error) {
            message.error('Ошибка загрузки рейтинга: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: <span style={{ color: 'var(--text-color)' }}>Место</span>,
            key: 'place',
            width: 100,
            render: (_, __, index) => {
                const place = index + 1;

                return (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s'
                    }}
                         onMouseEnter={(e) => {
                             e.currentTarget.style.backgroundColor = 'var(--menu-target-color)';
                         }}
                         onMouseLeave={(e) => {
                             e.currentTarget.style.backgroundColor = 'transparent';
                         }}
                    >
                        {place === 1 && (
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px',
                                fontWeight: 'bold',
                                color: '#000'
                            }}>
                                <CrownOutlined />
                            </div>
                        )}
                        {place === 2 && (
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                background: 'linear-gradient(135deg, #c0c0c0, #e0e0e0)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px',
                                fontWeight: 'bold',
                                color: '#000'
                            }}>
                                <StarFilled />
                            </div>
                        )}
                        {place === 3 && (
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                background: 'linear-gradient(135deg, #cd7f32, #e39e54)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px',
                                fontWeight: 'bold',
                                color: '#000'
                            }}>
                                <StarFilled />
                            </div>
                        )}
                        {place > 3 && (
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px',
                                fontWeight: 'bold',
                                color: 'var(--text-color)'
                            }}>
                                {place}
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Игрок</span>,
            dataIndex: 'fullName',
            key: 'fullName',
            render: (name, record, index) => (
                <Text
                    strong
                    style={{
                        color: 'var(--text-color)',
                        fontSize: index < 3 ? '16px' : '14px'
                    }}
                >
                    {name || 'Неизвестный игрок'}
                </Text>
            )
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Рейтинг</span>,
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            align: 'center',
            render: (rating, record, index) => (
                <Tag
                    color={index < 3 ? "blue" : "default"}
                    style={{
                        margin: 0,
                        color: index < 3 ? '#fff' : 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        fontWeight: 'bold',
                        fontSize: index < 3 ? '16px' : '14px',
                        backgroundColor: index < 3 ? '#1890ff' : 'transparent'
                    }}
                >
                    {rating || 0}
                </Tag>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
                <Text style={{ marginLeft: 10, color: 'var(--text-color)' }}>Загрузка рейтинга...</Text>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Title level={2} style={{ color: 'var(--text-color)', textAlign: 'center', marginBottom: 30 }}>
                <TrophyOutlined style={{ marginRight: 12, color: '#faad14' }} />
                Рейтинг игроков
            </Title>

            <Card
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Table
                    columns={columns}
                    dataSource={players.map((player, index) => ({
                        ...player,
                        key: index
                    }))}
                    loading={loading}
                    pagination={false}
                    locale={{
                        emptyText: 'Нет данных о игроках'
                    }}
                    size="middle"
                />

                {players.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <TrophyOutlined style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--text-secondary)' }} />
                        <div>Рейтинг игроков пока пуст</div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TopPlayers;