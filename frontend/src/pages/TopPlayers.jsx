import { useState, useEffect } from 'react';
import { Table, Card, Typography, Spin, message, Tag, Pagination, Avatar } from 'antd';
import { CrownOutlined, TrophyOutlined, StarFilled, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import client from '../api/client';

const { Title, Text } = Typography;

const TopPlayers = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [hoveredPlayer, setHoveredPlayer] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
    const navigate = useNavigate(); // Хук для навигации

    useEffect(() => {
        fetchTopPlayers(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const toApiUrl = (path) => {
        if (!path) return undefined;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const renderPlayerAvatar = (record, globalPlace) => {
        const isTop1 = globalPlace === 1;
        const isTop2 = globalPlace === 2;
        const isTop3 = globalPlace === 3;
        const isTop = isTop1 || isTop2 || isTop3;

        const ring = isTop1
            ? 'linear-gradient(135deg, #ffd700, #ffed4e)'
            : isTop2
                ? 'linear-gradient(135deg, #c0c0c0, #f0f0f0)'
                : isTop3
                    ? 'linear-gradient(135deg, #cd7f32, #f1b36b)'
                    : null;

        const src = toApiUrl(record.thumbUrl);

        // размеры можно подстроить
        const outerSize = 34;          // общий размер блока (с кольцом)
        const ringPadding = isTop ? 1 : 0; // толщина кольца
        const avatarSize = isTop ? outerSize - ringPadding * 2 : 28;

        return (
            <span
                style={{
                    display: 'inline-flex',
                    width: isTop ? outerSize : 28,
                    height: isTop ? outerSize : 28,
                    borderRadius: '50%',
                    padding: ringPadding,
                    background: ring || 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',

                    // заметный контур + тень (видно и на тёмном фоне)
                    border: isTop ? '1px solid rgba(255,255,255,0.25)' : '1px solid var(--border-color)',
                    boxShadow: isTop ? '0 0 0 2px rgba(0,0,0,0.25), 0 6px 18px rgba(0,0,0,0.35)' : 'none',

                    // чтобы тень не обрезалась, немного “выталкиваем” наружу
                    marginRight: 12,
                    flexShrink: 0,
                }}
            >
      <Avatar
          size={avatarSize}
          src={src}
          icon={<UserOutlined />}
          style={{
              width: avatarSize,
              height: avatarSize,
              minWidth: avatarSize,
              minHeight: avatarSize,
              borderRadius: '50%',
              objectFit: 'cover',
              backgroundColor: 'var(--card-bg)',
              border: '1px solid rgba(255,255,255,0.18)',
          }}
          onError={() => true}
      />
    </span>
        );
    };

    const fetchTopPlayers = async (page = 1, size = 10) => {
        try {
            setLoading(true);
            const response = await client.get(`/api/user/top?page=${page - 1}&size=${size}`);
            const pageData = response.data;

            setPlayers(Array.isArray(pageData.content) ? pageData.content : []);
            setTotalPages(pageData.totalPages || 0);
            setTotalElements(pageData.totalElements || 0);
        } catch (error) {
            message.error('Ошибка загрузки рейтинга: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    // Обработчик клика по игроку
    const handlePlayerClick = (playerId) => {
        navigate(`/profile/${playerId}`);
    };

    const columns = [
        {
            title: <span style={{ color: 'var(--text-color)' }}>Место</span>,
            key: 'place',
            width: 100,
            render: (_, __, index) => {
                const globalPlace = (currentPage - 1) * pageSize + index + 1;

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
                        {globalPlace === 1 && (
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
                        {globalPlace === 2 && (
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
                        {globalPlace === 3 && (
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
                        {globalPlace > 3 && (
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
                                {globalPlace}
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
            render: (name, record, index) => {
                const globalPlace = (currentPage - 1) * pageSize + index + 1;

                return (
                    <div
                        onClick={() => handlePlayerClick(record.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            transition: 'all 0.3s',
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--menu-target-color)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        {renderPlayerAvatar(record, globalPlace)}

                        <Text
                            strong
                            style={{
                                marginLeft: 10,
                                color: 'var(--text-color)',
                                fontSize: globalPlace < 4 ? '16px' : '14px',
                                borderBottom: '1px dashed transparent',
                                transition: 'border-color 0.3s'
                            }}
                            className="player-name"
                        >
                            {name || 'Неизвестный игрок'}
                        </Text>
                    </div>
                );
            }
        },
        {
            title: <span style={{ color: 'var(--text-color)' }}>Рейтинг</span>,
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            align: 'center',
            render: (rating, record, index) => {
                const globalPlace = (currentPage - 1) * pageSize + index + 1;
                return (
                    <Tag
                        color={globalPlace < 4 ? "blue" : "default"}
                        style={{
                            margin: 0,
                            color: globalPlace < 4 ? '#fff' : 'var(--text-color)',
                            borderColor: 'var(--border-color)',
                            fontWeight: 'bold',
                            fontSize: globalPlace < 4 ? '16px' : '14px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                        onClick={() => handlePlayerClick(record.id)}
                        onMouseEnter={(e) => {
                            if (globalPlace >= 4) {
                                e.currentTarget.style.backgroundColor = 'var(--menu-target-color)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (globalPlace >= 4) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                            }
                        }}
                    >
                        {rating?.toFixed(2) || 0}
                    </Tag>
                );
            }
        }
    ];

    // Добавляем стили для компонента
    const styles = `
        .player-row {
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .player-row:hover {
            background-color: var(--menu-target-color);
        }
        .player-name:hover {
            border-bottom-color: var(--primary-color);
        }
    `;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
                <Text style={{ marginLeft: 10, color: 'var(--text-color)' }}>Загрузка рейтинга...</Text>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            {/* Добавляем стили */}
            <style>{styles}</style>

            <Title level={2} style={{ color: 'var(--text-color)', textAlign: 'center', marginBottom: 30 }}>
                <TrophyOutlined style={{ marginRight: 12, color: '#faad14' }} />
                Рейтинг игроков
            </Title>

            <Card
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px'
                }}
            >
                <Table
                    columns={columns}
                    dataSource={players.map((player, index) => ({
                        ...player,
                        key: (currentPage - 1) * pageSize + index
                    }))}
                    loading={loading}
                    pagination={false}
                    locale={{
                        emptyText: 'Нет данных о игроках'
                    }}
                    size="middle"
                    onRow={(record) => ({
                        onClick: () => handlePlayerClick(record.id),
                        style: { cursor: 'pointer' },
                        className: 'player-row'
                    })}
                />

                {players.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <TrophyOutlined style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--text-secondary)' }} />
                        <div>Рейтинг игроков пока пуст</div>
                    </div>
                )}

                {(
                    <div style={{
                        marginTop: 24,
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '16px 0'
                    }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={totalElements}
                            onChange={handlePageChange}
                            onShowSizeChange={handlePageChange}
                            showSizeChanger={true}
                            pageSizeOptions={['10', '20', '50']}
                            showTotal={(total, range) =>
                                `Показано ${range[0]}-${range[1]} из ${total} игроков`
                            }
                            style={{ color: 'var(--text-color)' }}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TopPlayers;