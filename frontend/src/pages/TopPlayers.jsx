import { useState, useEffect } from 'react';
import { Table, Card, Typography, Spin, message, Tag, Pagination, Avatar, Grid, List } from 'antd';
import { CrownOutlined, TrophyOutlined, StarFilled, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import client from '../api/client';

const { Title, Text } = Typography;

const TopPlayers = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
    const navigate = useNavigate(); // Хук для навигации
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.sm;

    useEffect(() => {
        fetchTopPlayers(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const toApiUrl = (path) => {
        if (!path) return undefined;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const renderPlayerAvatar = (record, globalPlace, compact = false) => {
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
        const outerSize = compact ? 30 : 34; // общий размер блока (с кольцом)
        const ringPadding = isTop ? 1 : 0; // толщина кольца
        const avatarSize = isTop ? outerSize - ringPadding * 2 : (compact ? 26 : 28);

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
                    marginRight: compact ? 10 : 12,
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

    const renderPlaceBadge = (globalPlace, compact = false) => {
        const isTop1 = globalPlace === 1;
        const isTop2 = globalPlace === 2;
        const isTop3 = globalPlace === 3;

        const size = compact ? 28 : 32;
        const radius = compact ? 6 : 6;
        const fontSize = compact ? 13 : 14;
        const iconSize = compact ? 14 : 16;
        const marginRight = compact ? 10 : 12;

        const baseBox = {
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: `${radius}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight,
            fontWeight: 'bold',
            color: '#000',
            flexShrink: 0,
        };

        if (isTop1) {
            return (
                <div style={{ ...baseBox, background: 'linear-gradient(135deg, #ffd700, #ffed4e)' }}>
                    <CrownOutlined style={{ fontSize: iconSize }} />
                </div>
            );
        }

        if (isTop2) {
            return (
                <div style={{ ...baseBox, background: 'linear-gradient(135deg, #c0c0c0, #e0e0e0)' }}>
                    <StarFilled style={{ fontSize: iconSize }} />
                </div>
            );
        }

        if (isTop3) {
            return (
                <div style={{ ...baseBox, background: 'linear-gradient(135deg, #cd7f32, #e39e54)' }}>
                    <StarFilled style={{ fontSize: iconSize }} />
                </div>
            );
        }

        return (
            <div style={{
                ...baseBox,
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                fontSize,
            }}>
                {globalPlace}
            </div>
        );
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
                        {renderPlaceBadge(globalPlace)}
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
        .top-players-page {
            padding: 20px;
            max-width: 900px;
            margin: 0 auto;
        }
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
        .top-players-table {
            width: 100%;
            overflow-x: auto;
        }
        .top-players-list .ant-list-item {
            border-color: var(--border-color);
        }
        .top-players-list-item {
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .top-players-list-item:hover {
            background-color: var(--menu-target-color);
        }
        @media (max-width: 576px) {
            .top-players-page {
                padding: 12px;
            }
            .top-players-title {
                margin-bottom: 16px !important;
            }
            .top-players-title .anticon {
                margin-right: 8px !important;
            }
            .top-players-card {
                border-radius: 10px !important;
            }
            .top-players-pagination {
                margin-top: 16px !important;
                padding: 8px 0 !important;
            }
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
        <div className="top-players-page">
            {/* Добавляем стили */}
            <style>{styles}</style>

            <Title
                level={isMobile ? 3 : 2}
                className="top-players-title"
                style={{ color: 'var(--text-color)', textAlign: 'center', marginBottom: isMobile ? 16 : 30 }}
            >
                <TrophyOutlined style={{ marginRight: 12, color: '#faad14' }} />
                Рейтинг игроков
            </Title>

            <Card
                className="top-players-card"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px'
                }}
            >
                {isMobile ? (
                    <List
                        className="top-players-list"
                        dataSource={players}
                        locale={{ emptyText: 'Нет данных о игроках' }}
                        renderItem={(player, index) => {
                            const globalPlace = (currentPage - 1) * pageSize + index + 1;
                            return (
                                <List.Item
                                    className="top-players-list-item"
                                    onClick={() => handlePlayerClick(player.id)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        marginBottom: 8,
                                        background: 'transparent',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                            {renderPlaceBadge(globalPlace, true)}
                                            {renderPlayerAvatar(player, globalPlace, true)}
                                            <Text
                                                strong
                                                style={{
                                                    color: 'var(--text-color)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block',
                                                }}
                                            >
                                                {player.fullName || 'Неизвестный игрок'}
                                            </Text>
                                        </div>

                                        <Tag
                                            color={globalPlace < 4 ? "blue" : "default"}
                                            style={{
                                                margin: 0,
                                                color: globalPlace < 4 ? '#fff' : 'var(--text-color)',
                                                borderColor: 'var(--border-color)',
                                                fontWeight: 'bold',
                                                fontSize: '13px',
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {player.rating?.toFixed(2) || 0}
                                        </Tag>
                                    </div>
                                </List.Item>
                            );
                        }}
                    />
                ) : (
                    <div className="top-players-table">
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
                            scroll={{ x: 520 }}
                            onRow={(record) => ({
                                onClick: () => handlePlayerClick(record.id),
                                style: { cursor: 'pointer' },
                                className: 'player-row'
                            })}
                        />
                    </div>
                )}

                {players.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <TrophyOutlined style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--text-secondary)' }} />
                        <div>Рейтинг игроков пока пуст</div>
                    </div>
                )}

                {(
                    <div
                        className="top-players-pagination"
                        style={{
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
                            simple={isMobile}
                            showSizeChanger={!isMobile}
                            pageSizeOptions={isMobile ? ['10'] : ['10', '20', '50']}
                            showTotal={isMobile ? undefined : (total, range) =>
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