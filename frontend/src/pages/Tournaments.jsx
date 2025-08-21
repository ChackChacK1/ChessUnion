import { useState, useEffect } from 'react';
import { List, Card, Pagination, Tag, Typography, Spin, message, Alert } from 'antd';
import { CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTournaments(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const fetchTournaments = async (page, size) => {
        try {
            setLoading(true);
            setError(null);
            const response = await client.get('/api/tournament/all', {
                params: {
                    page: page - 1,
                    size: size,
                    sort: 'startDateTime,desc'
                }
            });

            console.log('API Response:', response.data);

            // Обработка ResponseEntity формата от Spring
            if (response.data && response.data.body) {
                // Данные находятся в response.data.body
                setTournaments(response.data.body);
                setTotalPages(1); // Поскольку пагинация обрабатывается на бэкенде
            } else if (Array.isArray(response.data)) {
                // Если данные пришли как простой массив
                setTournaments(response.data);
                setTotalPages(1);
            } else {
                setTournaments([]);
                setTotalPages(1);
            }

        } catch (error) {
            console.error('Error fetching tournaments:', error);
            setError('Ошибка загрузки турниров: ' + (error.response?.data?.message || error.message));
            message.error('Ошибка загрузки турниров');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
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

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert message="Ошибка" description={error} type="error" showIcon />
            </div>
        );
    }

    if (!tournaments || tournaments.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <Title level={4}>Турниры не найдены</Title>
                <Text>На данный момент нет активных турниров.</Text>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>Турниры</Title>

            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 3,
                    xxl: 3,
                }}
                dataSource={tournaments}
                renderItem={(tournament) => (
                    <List.Item key={tournament.id}>
                        <Link to={`/tournament/${tournament.id}`}>
                            <Card
                                hoverable
                                style={{ minHeight: '180px' }}
                            >
                                <Card.Meta
                                    title={tournament.name || 'Без названия'}
                                    description={
                                        <Text ellipsis={{ tooltip: tournament.description }}>
                                            {tournament.description || 'Описание отсутствует'}
                                        </Text>
                                    }
                                />

                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <CalendarOutlined style={{ marginRight: '8px' }} />
                                        <Text type="secondary">
                                            {tournament.startDateTime ?
                                                dayjs(tournament.startDateTime).format('DD.MM.YYYY HH:mm') :
                                                'Дата не указана'}
                                        </Text>
                                    </div>

                                    <div>
                                        <TrophyOutlined style={{ marginRight: '8px' }} />
                                        <Tag color={getStageColor(tournament.stage)}>
                                            {translateStage(tournament.stage) || 'Неизвестно'}
                                        </Tag>
                                    </div>

                                    {tournament.players && (
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary" small>
                                                Участников: {tournament.players.length}
                                                {tournament.maxAmountOfPlayers && ` / ${tournament.maxAmountOfPlayers}`}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    </List.Item>
                )}
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
        </div>
    );
};

export default Tournaments;