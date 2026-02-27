import { useEffect, useState } from 'react';
import { Card, List, Typography, Divider, Tag, Spin, message, Button, Space, Row, Col, Statistic, Pagination, Input, Progress } from 'antd'; // Добавили Progress
import { UserOutlined, MailOutlined, TrophyOutlined, CalendarOutlined, EditOutlined, LockOutlined, CrownOutlined, FallOutlined, MinusOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [matchesPage, setMatchesPage] = useState({ content: [], totalPages: 1, totalElements: 0 });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [editingAbout, setEditingAbout] = useState(false);
    const [aboutText, setAboutText] = useState('');
    const [updatingAbout, setUpdatingAbout] = useState(false);

    // Константа для максимальной длины
    const MAX_ABOUT_LENGTH = 1500;

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, [currentPage]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await client.get('/api/user/profile', {
                params: {
                    page: currentPage,
                    size: pageSize,
                    sort: 'createdAt,desc'
                }
            });
            const profileData = response.data;
            setProfile(profileData);
            setAboutText(profileData.aboutSelf || '');
            if (profileData.matches) {
                setMatchesPage(profileData.matches);
            }
        } catch (error) {
            message.error('Ошибка загрузки профиля: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigate('/profile/edit');
    };

    const handleChangePassword = () => {
        navigate('/change-password');
    };

    const handlePageChange = (page) => {
        setCurrentPage(page - 1);
    };

    const handleUpdateAboutSelf = async () => {
        if (aboutText.length > MAX_ABOUT_LENGTH) {
            message.error(`Текст не может превышать ${MAX_ABOUT_LENGTH} символов`);
            return;
        }

        setUpdatingAbout(true);
        try {
            await client.patch('/api/user/updateAboutSelf', aboutText, {
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
            message.success('Информация о себе обновлена');
            setEditingAbout(false);
            setProfile(prev => ({ ...prev, aboutSelf: aboutText }));
        } catch (error) {
            message.error('Ошибка обновления: ' + (error.response?.data?.message || error.message));
        } finally {
            setUpdatingAbout(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUpdateAboutSelf();
        } else if (e.key === 'Escape') {
            setEditingAbout(false);
            setAboutText(profile?.aboutSelf || '');
        }
    };

    // Функция для определения цвета счетчика
    const getCounterColor = (length) => {
        if (length >= MAX_ABOUT_LENGTH) return '#ff4d4f'; // Красный
        if (length >= MAX_ABOUT_LENGTH * 0.9) return '#faad14'; // Желтый
        return 'var(--text-color)'; // Обычный цвет
    };

    // Функция для определения процента заполнения
    const getProgressPercent = (length) => {
        return Math.min((length / MAX_ABOUT_LENGTH) * 100, 100);
    };

    const getResultText = (result) => {
        switch (result) {
            case 1: return 'Победа белых';
            case 0: return 'Победа чёрных';
            case 0.5: return 'Ничья';
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

    const calculateWinPercentage = () => {
        if (!profile?.amountOfMatches || profile.amountOfMatches === 0) return 0;
        return ((profile.amountOfWins / profile.amountOfMatches) * 100).toFixed(1);
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    if (!profile) {
        return <Text style={{ color: 'var(--text-color)' }}>Профиль не найден</Text>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Card
                title={
                    <span style={{ color: 'var(--text-color)' }}>
                        Профиль пользователя
                    </span>
                }
                bordered={false}
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
                extra={
                    <Space>
                        <Button
                            icon={<LockOutlined />}
                            onClick={handleChangePassword}
                            style={{
                                backgroundColor: 'var(--primary-color)',
                                borderColor: 'var(--primary-color)',
                                color: 'white'
                            }}
                        >
                            Смена пароля
                        </Button>
                        <Button
                            icon={<EditOutlined />}
                            onClick={handleEdit}
                            type="primary"
                            style={{
                                backgroundColor: 'var(--hover-color)',
                                borderColor: 'var(--hover-color)'
                            }}
                        >
                            Редактировать
                        </Button>
                    </Space>
                }
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    <UserOutlined style={{
                        fontSize: 24,
                        marginRight: 10,
                        color: 'var(--text-secondary)'
                    }} />
                    <Title level={4} style={{ margin: 0, color: 'var(--text-color)' }}>
                        {profile.firstName} {profile.lastName} {profile.surName}
                    </Title>
                </div>

                <Divider orientation="left" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    Основная информация
                </Divider>

                <div style={{ marginBottom: 20 }}>
                    <p style={{ color: 'var(--text-color)' }}>
                        <Text strong style={{ color: 'var(--text-color)' }}>Логин:</Text> {profile.username}
                    </p>
                    <p style={{ color: 'var(--text-color)' }}>
                        <Text strong style={{ color: 'var(--text-color)' }}>Email:</Text> {profile.email || 'Не указан'}
                    </p>

                    {/* Блок "О себе" с редактированием и счетчиком */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        marginBottom: '10px'
                    }}>
                        <Text strong style={{ color: 'var(--text-color)', minWidth: '20px' }}>
                            О себе:
                        </Text>
                        <div style={{ flex: 1 }}>
                            {editingAbout ? (
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <div style={{ position: 'relative' }}>
                                        <TextArea
                                            value={aboutText}
                                            onChange={(e) => setAboutText(e.target.value.slice(0, MAX_ABOUT_LENGTH))} // Обрезаем до максимума
                                            onKeyDown={handleKeyDown}
                                            autoSize={{ minRows: 3, maxRows: 8 }}
                                            placeholder="Расскажите о себе..."
                                            disabled={updatingAbout}
                                            maxLength={MAX_ABOUT_LENGTH} // Добавляем атрибут maxLength
                                            style={{
                                                backgroundColor: 'var(--input-bg)',
                                                color: 'var(--text-color)',
                                                borderColor: aboutText.length >= MAX_ABOUT_LENGTH ? '#ff4d4f' : 'var(--border-color)',
                                                paddingBottom: '30px' // Оставляем место для счетчика
                                            }}
                                        />
                                        {/* Счетчик символов */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            right: '12px',
                                            fontSize: '12px',
                                            color: getCounterColor(aboutText.length),
                                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            backdropFilter: 'blur(4px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <span>{aboutText.length}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>/</span>
                                            <span>{MAX_ABOUT_LENGTH}</span>
                                            {/* Прогресс бар в виде точки */}
                                            <div style={{
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '2px',
                                                backgroundColor: getCounterColor(aboutText.length),
                                                marginLeft: '4px',
                                                transition: 'all 0.3s',
                                                transform: `scaleX(${aboutText.length / MAX_ABOUT_LENGTH})`,
                                                transformOrigin: 'left'
                                            }} />
                                        </div>
                                    </div>

                                    {/* Дополнительный прогресс бар (опционально) */}
                                    <Progress
                                        percent={getProgressPercent(aboutText.length)}
                                        size="small"
                                        status={aboutText.length >= MAX_ABOUT_LENGTH ? 'exception' : 'active'}
                                        showInfo={false}
                                        strokeColor={getCounterColor(aboutText.length)}
                                    />

                                    <Space>
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={handleUpdateAboutSelf}
                                            loading={updatingAbout}
                                            disabled={aboutText.length > MAX_ABOUT_LENGTH}
                                        >
                                            Сохранить (Enter)
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setEditingAbout(false);
                                                setAboutText(profile.aboutSelf || '');
                                            }}
                                            disabled={updatingAbout}
                                        >
                                            Отмена (Esc)
                                        </Button>
                                    </Space>
                                </Space>
                            ) : (
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <span style={{
                                        color: profile.aboutSelf ? 'var(--text-color)' : 'var(--text-secondary)',
                                        fontStyle: profile.aboutSelf ? 'normal' : 'italic'
                                    }}>
                                        {profile.aboutSelf || 'расскажите о себе'}
                                    </span>
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => setEditingAbout(true)}
                                        size="small"
                                        style={{ color: 'var(--text-secondary)' }}
                                    />
                                </Space>
                            )}
                        </div>
                    </div>

                    {/* Индикатор длины для нередактируемого режима (опционально) */}
                    {!editingAbout && profile.aboutSelf && (
                        <div style={{
                            marginLeft: '57px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            marginTop: '-5px',
                            marginBottom: '5px'
                        }}>
                            {profile.aboutSelf.length} / {MAX_ABOUT_LENGTH} символов
                        </div>
                    )}

                    <p style={{ color: 'var(--text-color)' }}>
                        <Text strong style={{ color: 'var(--text-color)' }}>Рейтинг:</Text>
                        <Tag color="gold" style={{
                            color: 'var(--text-color)',
                            borderColor: 'var(--border-color)'
                        }}>
                            {profile.rating?.toFixed(2) || 'Нет данных'}
                        </Tag>
                    </p>
                    <p style={{ color: 'var(--text-color)' }}>
                        <CalendarOutlined style={{
                            marginRight: 8,
                            color: 'var(--text-secondary)'
                        }} />
                        <Text strong style={{ color: 'var(--text-color)' }}>Дата регистрации:</Text>
                        <span style={{ color: 'var(--text-color)' }}>
                            {dayjs(profile.createdAt).format('DD.MM.YYYY HH:mm')}
                        </span>
                    </p>
                </div>

                {/* Остальная часть компонента без изменений */}
                <Divider orientation="left" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    Статистика игр
                </Divider>

                {/* ... статистика игр ... */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={12} sm={6}>
                        <Card
                            size="small"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <Statistic
                                title="Всего игр"
                                value={profile.amountOfMatches || 0}
                                prefix={<BarChartOutlined />}
                                valueStyle={{ color: 'var(--text-color)' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card
                            size="small"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <Statistic
                                title="Победы"
                                value={profile.amountOfWins || 0}
                                prefix={<CrownOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card
                            size="small"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <Statistic
                                title="Поражения"
                                value={profile.amountOfLosses || 0}
                                prefix={<FallOutlined style={{ color: '#ff4d4f' }} />}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card
                            size="small"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <Statistic
                                title="Ничьи"
                                value={profile.amountOfDraws || 0}
                                prefix={<MinusOutlined style={{ color: '#1890ff' }} />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {profile.amountOfMatches > 0 && (
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                        <Col xs={12} sm={6}>
                            <Card
                                size="small"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                <Statistic
                                    title="Процент побед"
                                    value={calculateWinPercentage()}
                                    suffix="%"
                                    valueStyle={{ color: 'var(--text-color)' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card
                                size="small"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                <Statistic
                                    title="Очков набрано"
                                    value={(profile.amountOfWins * 1 + profile.amountOfDraws * 0.5).toFixed(1)}
                                    valueStyle={{ color: 'var(--text-color)' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                )}

                <Divider orientation="left" style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                }}>
                    История матчей {matchesPage.totalElements > 0 && `(${matchesPage.totalElements})`}
                </Divider>

                {matchesPage.content && matchesPage.content.length > 0 ? (
                    <>
                        <List
                            dataSource={matchesPage.content}
                            style={{ color: 'var(--text-color)' }}
                            renderItem={(match) => (
                                <List.Item style={{
                                    borderBottom: '1px solid var(--border-color)',
                                    padding: '12px 0'
                                }}>
                                    <div style={{ width: '100%' }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr auto 1fr',
                                            textAlign: 'center',
                                            marginBottom: 8,
                                            fontWeight: 'bold',
                                            color: 'var(--text-color)'
                                        }}>
                                            <span>Белые</span>
                                            <span>Результат</span>
                                            <span>Чёрные</span>
                                        </div>

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr auto 1fr',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            color: 'var(--text-color)'
                                        }}>
                                            <Text strong style={{ color: 'var(--text-color)' }}>
                                                {match.whitePlayer?.fullName || 'Неизвестный игрок'}
                                            </Text>

                                            <Tag
                                                color={getResultColor(match.result)}
                                                style={{
                                                    margin: '0 10px',
                                                    color: 'var(--text-color)',
                                                    borderColor: 'var(--border-color)'
                                                }}
                                            >
                                                {getResultText(match.result)}
                                            </Tag>

                                            <Text strong style={{ color: 'var(--text-color)' }}>
                                                {match.blackPlayer?.fullName || 'Неизвестный игрок'}
                                            </Text>
                                        </div>

                                        {match.createdAt && (
                                            <div style={{
                                                textAlign: 'center',
                                                marginTop: 8,
                                                fontSize: '12px',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                <CalendarOutlined style={{ marginRight: 4 }} />
                                                {dayjs(match.createdAt).format('DD.MM.YYYY HH:mm')}
                                            </div>
                                        )}
                                    </div>
                                </List.Item>
                            )}
                        />

                        {matchesPage.totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: 20
                            }}>
                                <Pagination
                                    current={currentPage + 1}
                                    total={matchesPage.totalElements}
                                    pageSize={pageSize}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    showTotal={(total) => `Всего ${total} матчей`}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <Text style={{ color: 'var(--text-color)' }}>Матчей пока нет</Text>
                )}
            </Card>
        </div>
    );
};

export default Profile;