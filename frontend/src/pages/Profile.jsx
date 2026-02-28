import { useEffect, useState } from 'react';
import {
    Card,
    List,
    Typography,
    Divider,
    Tag,
    Spin,
    message,
    Button,
    Space,
    Row,
    Col,
    Statistic,
    Pagination,
    Input,
    Progress,
    Modal,
    Upload,
    Avatar,
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    EditOutlined,
    LockOutlined,
    CrownOutlined,
    FallOutlined,
    MinusOutlined,
    BarChartOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Настройки для аватара
const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [matchesPage, setMatchesPage] = useState({ content: [], totalPages: 1, totalElements: 0 });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [editingAbout, setEditingAbout] = useState(false);
    const [aboutText, setAboutText] = useState('');
    const [updatingAbout, setUpdatingAbout] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
    // Avatar modal/upload
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarVersion, setAvatarVersion] = useState(0); // чтобы принудительно обновлять картинку после аплоада

    // Константа для максимальной длины
    const MAX_ABOUT_LENGTH = 1500;

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await client.get('/api/user/profile', {
                params: {
                    page: currentPage,
                    size: pageSize,
                    sort: 'createdAt,desc',
                },
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

    const handleEdit = () => navigate('/profile/edit');
    const handleChangePassword = () => navigate('/change-password');

    const handlePageChange = (page) => setCurrentPage(page - 1);

    const handleUpdateAboutSelf = async () => {
        if (aboutText.length > MAX_ABOUT_LENGTH) {
            message.error(`Текст не может превышать ${MAX_ABOUT_LENGTH} символов`);
            return;
        }

        setUpdatingAbout(true);
        try {
            await client.patch('/api/user/updateAboutSelf', aboutText, {
                headers: { 'Content-Type': 'text/plain' },
            });
            message.success('Информация о себе обновлена');
            setEditingAbout(false);
            setProfile((prev) => ({ ...prev, aboutSelf: aboutText }));
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
        if (length >= MAX_ABOUT_LENGTH) return '#ff4d4f';
        if (length >= MAX_ABOUT_LENGTH * 0.9) return '#faad14';
        return 'var(--text-color)';
    };

    // Функция для определения процента заполнения
    const getProgressPercent = (length) => Math.min((length / MAX_ABOUT_LENGTH) * 100, 100);

    const getResultText = (result) => {
        switch (result) {
            case 1:
                return 'Победа белых';
            case 0:
                return 'Победа чёрных';
            case 0.5:
                return 'Ничья';
            default:
                return 'Не завершён';
        }
    };

    const getResultColor = (result) => {
        switch (result) {
            case 1:
                return 'green';
            case 0:
                return 'red';
            case 0.5:
                return 'blue';
            default:
                return 'gray';
        }
    };

    const calculateWinPercentage = () => {
        if (!profile?.amountOfMatches || profile.amountOfMatches === 0) return 0;
        return ((profile.amountOfWins / profile.amountOfMatches) * 100).toFixed(1);
    };

    // ---------- PROFILE IMAGE (GET/POST) ----------
    const getProfileImageUrl = () => {
        if (!profile?.id) return undefined;
        return `${API_BASE_URL}/api/profile_image/${profile.id}?v=${avatarVersion}`;
    };

    const validateBeforeUpload = (file) => {
        const isAllowedType = ALLOWED_TYPES.includes(file.type);
        if (!isAllowedType) {
            message.error('Допустимые форматы: JPG, PNG, WEBP');
            return Upload.LIST_IGNORE;
        }

        const isLtMax = file.size / 1024 / 1024 < MAX_IMAGE_MB;
        if (!isLtMax) {
            message.error(`Максимальный размер файла: ${MAX_IMAGE_MB}MB`);
            return Upload.LIST_IGNORE;
        }

        return true;
    };

    const uploadAvatar = async (file) => {
        if (!profile?.id) {
            message.error('Не удалось определить пользователя');
            return false;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadingAvatar(true);
            await client.post(`/api/profile_image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            message.success('Фотография профиля обновлена');
            setAvatarVersion((v) => v + 1); // сброс кеша в браузере
            setAvatarModalOpen(false);
            return true;
        } catch (error) {
            message.error('Ошибка загрузки: ' + (error.response?.data?.message || error.message));
            return false;
        } finally {
            setUploadingAvatar(false);
        }
    };

    const FancyAvatar = ({ src, size = 80, ring = false, onClick, hint }) => {
        const outer = ring ? size + 8 : size;    // внешний размер (кольцо)
        const pad = ring ? 2 : 0;                // толщина кольца
        const inner = outer - pad * 2;

        return (
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <span
          onClick={onClick}
          style={{
              display: 'inline-flex',
              width: outer,
              height: outer,
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              padding: pad,
              boxSizing: 'border-box',
              background: ring ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : 'transparent',
              border: ring ? '1px solid rgba(255,255,255,0.25)' : '1px solid var(--border-color)',
              boxShadow: ring ? '0 0 0 2px rgba(0,0,0,0.25), 0 10px 26px rgba(0,0,0,0.35)' : 'none',
              cursor: onClick ? 'pointer' : 'default',
          }}
      >
        <Avatar
            size={inner}
            src={src}
            icon={<UserOutlined />}
            onError={() => true}
            style={{
                width: inner,
                height: inner,
                minWidth: inner,
                minHeight: inner,
                borderRadius: '50%',
                backgroundColor: 'var(--card-bg)',
                border: '1px solid rgba(255,255,255,0.18)',
            }}
        />
      </span>

                {hint && (
                    <Text style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        {hint}
                    </Text>
                )}
            </div>
        );
    };

    const uploadProps = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        accept: '.jpg,.jpeg,.png,.webp',
        beforeUpload: (file) => {
            const ok = validateBeforeUpload(file);
            if (ok !== true) return ok;
            // ручная загрузка
            uploadAvatar(file);
            return false;
        },
    };

    // ---------------------------------------------

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
    }

    if (!profile) {
        return <Text style={{ color: 'var(--text-color)' }}>Профиль не найден</Text>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Card
                title={<span style={{ color: 'var(--text-color)' }}>Профиль пользователя</span>}
                bordered={false}
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                extra={
                    <Space>
                        <Button
                            icon={<LockOutlined />}
                            onClick={handleChangePassword}
                            style={{
                                backgroundColor: 'var(--primary-color)',
                                borderColor: 'var(--primary-color)',
                                color: 'white',
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
                                borderColor: 'var(--hover-color)',
                            }}
                        >
                            Редактировать
                        </Button>
                    </Space>
                }
            >
                {/* ---------- HEADER (avatar + name) ---------- */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FancyAvatar
                            size={110}
                            ring={true}
                            src={getProfileImageUrl()}
                            onClick={() => setAvatarModalOpen(true)}
                            hint="Нажмите, чтобы изменить"
                        />

                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <UserOutlined style={{ fontSize: 24, marginRight: 10, color: 'var(--text-secondary)' }} />
                        <Title level={4} style={{ margin: 0, color: 'var(--text-color)' }}>
                            {profile.firstName} {profile.lastName} {profile.surName}
                        </Title>
                    </div>
                </div>

                {/* ---------- Avatar upload modal ---------- */}
                <Modal
                    title="Загрузка фотографии профиля"
                    open={avatarModalOpen}
                    onCancel={() => !uploadingAvatar && setAvatarModalOpen(false)}
                    footer={null}
                    centered
                >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <div>
                            <Text style={{ color: 'var(--text-color)' }}>
                                Допустимые форматы: <Text strong>JPG, PNG, WEBP</Text>
                            </Text>
                            <br />
                            <Text style={{ color: 'var(--text-color)' }}>
                                Максимальный размер: <Text strong>{MAX_IMAGE_MB}MB</Text>
                            </Text>
                        </div>

                        <div
                            style={{
                                padding: 16,
                                borderRadius: 10,
                                border: '1px dashed var(--border-color)',
                                background: 'var(--card-bg)',
                            }}
                        >
                            <Upload.Dragger {...uploadProps} disabled={uploadingAvatar}>
                                <p className="ant-upload-drag-icon">
                                    <UploadOutlined />
                                </p>
                                <p className="ant-upload-text" style={{ color: 'var(--text-color)' }}>
                                    Перетащите изображение сюда или нажмите для выбора
                                </p>
                                <p className="ant-upload-hint" style={{ color: 'var(--text-secondary)' }}>
                                    Файл будет загружен сразу после выбора
                                </p>
                            </Upload.Dragger>
                        </div>

                        {uploadingAvatar && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Spin />
                                <Text style={{ color: 'var(--text-color)' }}>Загрузка...</Text>
                            </div>
                        )}
                    </Space>
                </Modal>

                {/* ---------- MAIN INFO ---------- */}
                <Divider orientation="left" style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                    Основная информация
                </Divider>

                <div style={{ marginBottom: 20 }}>
                    <p style={{ color: 'var(--text-color)' }}>
                        <Text strong style={{ color: 'var(--text-color)' }}>
                            Логин:
                        </Text>{' '}
                        {profile.username}
                    </p>
                    <p style={{ color: 'var(--text-color)' }}>
                        <Text strong style={{ color: 'var(--text-color)' }}>
                            Email:
                        </Text>{' '}
                        {profile.email || 'Не указан'}
                    </p>

                    {/* Блок "О себе" */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '10px' }}>
                        <Text strong style={{ color: 'var(--text-color)', minWidth: '20px' }}>
                            О себе:
                        </Text>
                        <div style={{ flex: 1 }}>
                            {editingAbout ? (
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <div style={{ position: 'relative' }}>
                                        <TextArea
                                            value={aboutText}
                                            onChange={(e) => setAboutText(e.target.value.slice(0, MAX_ABOUT_LENGTH))}
                                            onKeyDown={handleKeyDown}
                                            autoSize={{ minRows: 3, maxRows: 8 }}
                                            placeholder="Расскажите о себе..."
                                            disabled={updatingAbout}
                                            maxLength={MAX_ABOUT_LENGTH}
                                            style={{
                                                backgroundColor: 'var(--input-bg)',
                                                color: 'var(--text-color)',
                                                borderColor:
                                                    aboutText.length >= MAX_ABOUT_LENGTH ? '#ff4d4f' : 'var(--border-color)',
                                                paddingBottom: '30px',
                                            }}
                                        />
                                        <div
                                            style={{
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
                                                gap: '6px',
                                            }}
                                        >
                                            <span>{aboutText.length}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>/</span>
                                            <span>{MAX_ABOUT_LENGTH}</span>
                                            <div
                                                style={{
                                                    width: '4px',
                                                    height: '4px',
                                                    borderRadius: '2px',
                                                    backgroundColor: getCounterColor(aboutText.length),
                                                    marginLeft: '4px',
                                                    transition: 'all 0.3s',
                                                    transform: `scaleX(${aboutText.length / MAX_ABOUT_LENGTH})`,
                                                    transformOrigin: 'left',
                                                }}
                                            />
                                        </div>
                                    </div>

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
                  <span
                      style={{
                          color: profile.aboutSelf ? 'var(--text-color)' : 'var(--text-secondary)',
                          fontStyle: 'normal',
                      }}
                  >
                    {profile.aboutSelf || 'Расскажите о себе...'}
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

                    {!editingAbout && profile.aboutSelf && (
                        <div
                            style={{
                                marginLeft: '57px',
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                marginTop: '-5px',
                                marginBottom: '5px',
                            }}
                        >
                            {profile.aboutSelf.length} / {MAX_ABOUT_LENGTH} символов
                        </div>
                    )}

                    <p style={{ color: 'var(--text-color)' }}>
                        <Text strong style={{ color: 'var(--text-color)' }}>
                            Рейтинг:
                        </Text>{' '}
                        <Tag color="gold" style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                            {profile.rating?.toFixed(2) || 'Нет данных'}
                        </Tag>
                    </p>
                    <p style={{ color: 'var(--text-color)' }}>
                        <CalendarOutlined style={{ marginRight: 8, color: 'var(--text-secondary)' }} />
                        <Text strong style={{ color: 'var(--text-color)' }}>
                            Дата регистрации:
                        </Text>{' '}
                        <span style={{ color: 'var(--text-color)' }}>{dayjs(profile.createdAt).format('DD.MM.YYYY HH:mm')}</span>
                    </p>
                </div>

                {/* ---------- STATS ---------- */}
                <Divider orientation="left" style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                    Статистика игр
                </Divider>

                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={12} sm={6}>
                        <Card size="small" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            <Statistic
                                title="Всего игр"
                                value={profile.amountOfMatches || 0}
                                prefix={<BarChartOutlined />}
                                valueStyle={{ color: 'var(--text-color)' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card size="small" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            <Statistic
                                title="Победы"
                                value={profile.amountOfWins || 0}
                                prefix={<CrownOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card size="small" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            <Statistic
                                title="Поражения"
                                value={profile.amountOfLosses || 0}
                                prefix={<FallOutlined style={{ color: '#ff4d4f' }} />}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card size="small" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
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
                            <Card size="small" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <Statistic
                                    title="Процент побед"
                                    value={calculateWinPercentage()}
                                    suffix="%"
                                    valueStyle={{ color: 'var(--text-color)' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card size="small" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <Statistic
                                    title="Очков набрано"
                                    value={(profile.amountOfWins * 1 + profile.amountOfDraws * 0.5).toFixed(1)}
                                    valueStyle={{ color: 'var(--text-color)' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* ---------- MATCHES ---------- */}
                <Divider orientation="left" style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                    История матчей {matchesPage.totalElements > 0 && `(${matchesPage.totalElements})`}
                </Divider>

                {matchesPage.content && matchesPage.content.length > 0 ? (
                    <>
                        <List
                            dataSource={matchesPage.content}
                            style={{ color: 'var(--text-color)' }}
                            renderItem={(match) => (
                                <List.Item style={{ borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
                                    <div style={{ width: '100%' }}>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr auto 1fr',
                                                textAlign: 'center',
                                                marginBottom: 8,
                                                fontWeight: 'bold',
                                                color: 'var(--text-color)',
                                            }}
                                        >
                                            <span>Белые</span>
                                            <span>Результат</span>
                                            <span>Чёрные</span>
                                        </div>

                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr auto 1fr',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                color: 'var(--text-color)',
                                            }}
                                        >
                                            <Text strong style={{ color: 'var(--text-color)' }}>
                                                {match.whitePlayer?.fullName || 'Неизвестный игрок'}
                                            </Text>

                                            <Tag
                                                color={getResultColor(match.result)}
                                                style={{ margin: '0 10px', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
                                            >
                                                {getResultText(match.result)}
                                            </Tag>

                                            <Text strong style={{ color: 'var(--text-color)' }}>
                                                {match.blackPlayer?.fullName || 'Неизвестный игрок'}
                                            </Text>
                                        </div>

                                        {match.createdAt && (
                                            <div
                                                style={{
                                                    textAlign: 'center',
                                                    marginTop: 8,
                                                    fontSize: '12px',
                                                    color: 'var(--text-secondary)',
                                                }}
                                            >
                                                <CalendarOutlined style={{ marginRight: 4 }} />
                                                {dayjs(match.createdAt).format('DD.MM.YYYY HH:mm')}
                                            </div>
                                        )}
                                    </div>
                                </List.Item>
                            )}
                        />

                        {matchesPage.totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
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