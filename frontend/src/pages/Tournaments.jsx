import { useState, useEffect } from 'react';
import {
    List, Card, Pagination, Tag, Typography, Spin, message,
    Alert, Space, Select, Row, Col
} from 'antd';
import {
    CalendarOutlined, TrophyOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Tournaments = () => {
    const [allTournaments, setAllTournaments] = useState([]); // Все турниры с сервера
    const [filteredTournaments, setFilteredTournaments] = useState([]); // Отфильтрованные для отображения
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(9);
    const [error, setError] = useState(null);

    // Состояние для фильтрации
    const [stageFilter, setStageFilter] = useState('all'); // 'all', 'active', 'finished'

    // Загружаем все турниры один раз
    useEffect(() => {
        fetchAllTournaments();
    }, []);

    // Применяем фильтр и пагинацию при изменении фильтра или страницы
    useEffect(() => {
        applyFilterAndPagination();
    }, [stageFilter, currentPage, pageSize, allTournaments]);

    const fetchAllTournaments = async () => {
        try {
            setLoading(true);
            setError(null);

            // Загружаем все турниры (можно увеличить size, чтобы получить все)
            const response = await client.get('/api/tournament/all', {
                params: {
                    page: 0,
                    size: 100, // Достаточно большой размер, чтобы получить все турниры
                    sort: 'startDateTime,desc'
                }
            });

            console.log('API Response:', response.data);

            // Обработка Page объекта
            if (response.data && response.data.content) {
                setAllTournaments(response.data.content || []);
            } else if (Array.isArray(response.data)) {
                setAllTournaments(response.data);
            } else {
                setAllTournaments([]);
            }

        } catch (error) {
            console.error('Error fetching tournaments:', error);
            setError('Ошибка загрузки турниров: ' + (error.response?.data?.message || error.message));
            message.error('Ошибка загрузки турниров');
        } finally {
            setLoading(false);
        }
    };

    // Функция для фильтрации и пагинации на фронтенде
    const applyFilterAndPagination = () => {
        // Фильтрация
        let filtered = [...allTournaments];

        if (stageFilter === 'finished') {
            filtered = filtered.filter(t => t.stage === 'FINISHED');
        } else if (stageFilter === 'active') {
            filtered = filtered.filter(t => t.stage === 'REGISTRATION' || t.stage === 'PLAYING');
        }

        // Обновляем общее количество элементов
        setTotalElements(filtered.length);

        // Расчет пагинации
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filtered.slice(startIndex, endIndex);

        setFilteredTournaments(paginatedData);
        setTotalPages(Math.ceil(filtered.length / pageSize));
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const handleStageChange = (value) => {
        setStageFilter(value);
        setCurrentPage(1); // Сбрасываем на первую страницу
    };

    const getStageColor = (stage) => {
        const colors = {
            'REGISTRATION': 'green',
            'PLAYING': 'blue',
            'FINISHED': 'red',
        };
        return colors[stage] || 'default';
    };

    const translateStage = (stage) => {
        const translations = {
            'ANNOUNCED': 'Анонсирован',
            'REGISTRATION': 'Регистрация',
            'PLAYING': 'В процессе',
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

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Заголовок и фильтры */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
                        Турниры
                    </Title>
                </Col>
                <Col>
                    <Space>
                        {/* Индикатор активного фильтра */}
                        {stageFilter !== 'all' && (
                            <Tag color="blue" style={{ marginRight: 8 }}>
                                {stageFilter === 'finished' ? 'Завершенные' : 'Активные'}
                            </Tag>
                        )}

                        {/* Выпадающий список для фильтрации */}
                        <Select
                            value={stageFilter}
                            onChange={handleStageChange}
                            style={{ width: 180 }}
                            placeholder="Фильтр по статусу"
                        >
                            <Option value="all">Все турниры</Option>
                            <Option value="active">Активные (регистрация/игра)</Option>
                            <Option value="finished">Завершенные</Option>
                        </Select>
                    </Space>
                </Col>
            </Row>

            {/* Информация о количестве */}
            {totalElements > 0 && (
                <Text style={{ color: '#ffffff', display: 'block', marginBottom: 16 }}>
                    Найдено турниров: {totalElements}
                </Text>
            )}

            {/* Список турниров */}
            {filteredTournaments && filteredTournaments.length > 0 ? (
                <>
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
                        dataSource={filteredTournaments}
                        renderItem={(tournament) => (
                            <List.Item key={tournament.id}>
                                <Link to={`/tournament/${tournament.id}`}>
                                    <Card
                                        hoverable
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--card-target)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                                        }}
                                        style={{
                                            minHeight: '140px',
                                            backgroundColor: 'var(--card-bg)',
                                            borderColor: 'var(--border-color)'
                                        }}
                                        bodyStyle={{
                                            color: 'var(--text-color)'
                                        }}
                                    >
                                        <Card.Meta
                                            title={
                                                <span style={{ color: 'var(--text-color)' }}>
                                                    {tournament.name || 'Без названия'}
                                                </span>
                                            }
                                        />

                                        <div style={{ marginTop: '16px' }}>
                                            <div style={{ marginBottom: '8px' }}>
                                                <CalendarOutlined style={{ marginRight: '8px', color: 'var(--text-secondary)' }} />
                                                <Text style={{ color: 'var(--text-secondary)' }}>
                                                    {tournament.startDateTime ?
                                                        dayjs(tournament.startDateTime).format('DD.MM.YYYY HH:mm') :
                                                        'Дата не указана'}
                                                </Text>
                                            </div>

                                            <div style={{ marginBottom: '8px' }}>
                                                <TrophyOutlined style={{ marginRight: '8px', color: 'var(--text-secondary)' }} />
                                                <Tag
                                                    color={getStageColor(tournament.stage)}
                                                    style={{
                                                        color: 'var(--text-color)',
                                                        borderColor: 'var(--border-color)'
                                                    }}
                                                >
                                                    {translateStage(tournament.stage) || 'Неизвестно'}
                                                </Tag>
                                            </div>

                                            <div>
                                                <UserOutlined style={{ marginRight: '8px', color: 'var(--text-secondary)' }} />
                                                <Text style={{ color: 'var(--text-secondary)' }}>
                                                    Участники: {tournament.playersRegistered || 0}
                                                    {tournament.maxAmountOfPlayers && ` / ${tournament.maxAmountOfPlayers}`}
                                                </Text>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </List.Item>
                        )}
                    />

                    {/* Пагинация */}
                    {(
                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={totalElements}
                                onChange={handlePageChange}
                                showSizeChanger={true}
                                pageSizeOptions={['9', '18', '45']}
                                showTotal={(total) => `Всего ${total} турниров`}
                                style={{ color: 'var(--text-color)' }}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Title level={4} style={{ color: 'var(--text-color)' }}>
                        {stageFilter === 'finished'
                            ? 'Завершенные турниры не найдены'
                            : stageFilter === 'active'
                                ? 'Активные турниры не найдены'
                                : 'Турниры не найдены'}
                    </Title>
                    <Text style={{ color: 'var(--text-secondary)' }}>
                        {stageFilter === 'finished'
                            ? 'Завершенные турниры появятся здесь после окончания'
                            : stageFilter === 'active'
                                ? 'На данный момент нет активных турниров'
                                : 'На данный момент нет доступных турниров'}
                    </Text>
                </div>
            )}
        </div>
    );
};

export default Tournaments;