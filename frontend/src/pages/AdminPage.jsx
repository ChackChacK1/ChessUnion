import { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    DatePicker,
    InputNumber,
    message,
    Typography,
    Row,
    Col,
    List,
    Tabs,
    Tag,
    Spin,
    Space,
    Grid,
    Popconfirm,
    Select
} from 'antd';
import {
    PlusOutlined,
    SettingOutlined,
    EditOutlined,
    EnvironmentOutlined,
    UserOutlined,
    TeamOutlined,
    UserAddOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import dayjs from 'dayjs';
import {
    Modal,
    // ... остальные существующие импорты ...
} from 'antd';
import {
    ReloadOutlined,
    // ... остальные существующие импорты ...
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const AdminPage = () => {
    const [form] = Form.useForm();
    const [adminForm] = Form.useForm(); // Форма для назначения администратора
    const [loading, setLoading] = useState(false);
    const [adminLoading, setAdminLoading] = useState(false); // Loading для назначения админа
    const [runningTournaments, setRunningTournaments] = useState([]);
    const [tournamentsLoading, setTournamentsLoading] = useState(false);
    const navigate = useNavigate();
    const screens = useBreakpoint();

    const isMobile = !screens.md;
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [banModalVisible, setBanModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [banDuration, setBanDuration] = useState(null);

    // Функция загрузки пользователей
    const fetchUsers = async (page = 1, pageSize = 10) => {
        try {
            setUsersLoading(true);
            const response = await client.get('/api/admin/user/list', {
                params: {
                    page: page - 1,
                    size: pageSize
                }
            });

            setUsers(response.data.content || []);
            setPagination({
                current: response.data.number + 1,
                pageSize: response.data.size,
                total: response.data.totalElements
            });
        } catch (error) {
            message.error('Ошибка загрузки пользователей: ' + (error.response?.data?.message || error.message));
        } finally {
            setUsersLoading(false);
        }
    };

    // Функция удаления пользователя
    const handleDeleteUser = async (userId) => {
        try {
            await client.delete(`/api/admin/user/${userId}`);
            message.success('Пользователь успешно удалён');
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('Ошибка удаления пользователя: ' + (error.response?.data?.message || error.message));
        }
    };

    // Функция бана пользователя
    const handleBanUser = async (userId, durationDays = null) => {
        try {
            await client.post(`/api/admin/user/ban/${userId}`,
                durationDays ? { durationDays } : null,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            message.success('Пользователь успешно забанен');
            setBanModalVisible(false);
            setSelectedUser(null);
            setBanDuration(null);
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('Ошибка бана пользователя: ' + (error.response?.data?.message || error.message));
        }
    };

    // Функция разбана пользователя
    const handleUnbanUser = async (userId) => {
        try {
            await client.post(`/api/admin/user/unban/${userId}`);
            message.success('Пользователь успешно разбанен');
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('Ошибка разбана пользователя: ' + (error.response?.data?.message || error.message));
        }
    };

    // Функция открытия модалки бана
    const openBanModal = (user) => {
        setSelectedUser(user);
        setBanModalVisible(true);
    };

    // Эффект для загрузки пользователей при переходе на вкладку
    useEffect(() => {
        // Можно добавить логику для загрузки при открытии вкладки
    }, []);
    const fetchRunningTournaments = async () => {
        try {
            setTournamentsLoading(true);
            const response = await client.get('/api/admin/tournament/running');
            setRunningTournaments(response.data || []);
        } catch (error) {
            message.error('Ошибка загрузки турниров: ' + (error.response?.data?.message || error.message));
        } finally {
            setTournamentsLoading(false);
        }
    };

    useEffect(() => {
        fetchRunningTournaments();
    }, []);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const tournamentData = {
                name: values.name,
                address: values.address,
                description: values.description,
                startDateTime: values.startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
                maxAmountOfPlayers: values.maxAmountOfPlayers,
                minAmountOfPlayers: values.minAmountOfPlayers,
                amountOfRounds: values.amountOfRounds,
                systemType: values.systemType
            };

            await client.post('/api/admin/tournament/create', tournamentData);
            message.success('Турнир успешно создан!');
            form.resetFields();
            fetchRunningTournaments();

        } catch (error) {
            message.error('Ошибка создания турнира: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Функция для назначения администратора
    const onAssignAdmin = async (values) => {
        try {
            setAdminLoading(true);

            // Создаем объект PromoteToAdminDto
            const promoteToAdminDto = {
                username: values.username
            };

            await client.patch('/api/user/setAdmin', promoteToAdminDto, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            message.success('Пользователь успешно назначен администратором!');
            adminForm.resetFields();
        } catch (error) {
            message.error('Ошибка назначения администратора: ' + (error.response?.data?.message || error.message));
        } finally {
            setAdminLoading(false);
        }
    };

    const getStageTag = (stage) => {
        const stageConfig = {
            REGISTRATION: { color: 'blue', text: 'Регистрация' },
            PLAYING: { color: 'green', text: 'Идёт' },
            FINISHED: { color: 'red', text: 'Завершён' }
        };
        const config = stageConfig[stage] || { color: 'default', text: stage };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const handleTournamentClick = (tournament) => {
        navigate(`/admin/tournament/${tournament.id}/${tournament.currentRound}`);
    };

    const handleManagePlayers = (tournament, e) => {
        e.stopPropagation();
        navigate(`/admin/players/${tournament.id}`);
    };

    const handleEditTournament = (tournament, e) => {
        e.stopPropagation();
        navigate(`/admin/tournament/${tournament.id}/edit`);
    };

    const handleDeleteTournament = async (tournamentId) => {
        try {
            await client.delete(`/api/admin/tournament/${tournamentId}`);
            message.success('Турнир успешно удалён');
            fetchRunningTournaments();
        } catch (error) {
            message.error('Ошибка удаления турнира: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div style={{ padding: isMobile ? '12px' : '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={isMobile ? 3 : 2} style={{ color: 'var(--text-color)', marginBottom: 24 }}>
                Панель администратора
            </Title>

            <Tabs
                defaultActiveKey="management"
                type={isMobile ? "line" : "card"}
                style={{ color: 'var(--text-color)' }}
                tabPosition={isMobile ? "top" : "top"}
                size={isMobile ? "small" : "middle"}
            >
                <TabPane
                    tab={
                        <span style={{color: 'var(--text-color)'}}>
                            <SettingOutlined />
                            {isMobile ? 'Турниры' : 'Управление турнирами'}
                        </span>
                    }
                    key="management"
                >
                    <Card
                        title={<span style={{ color: 'var(--text-color)', fontSize: isMobile ? '16px' : '18px' }}>Активные турниры</span>}
                        bordered={false}
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)'
                        }}
                        bodyStyle={{ padding: isMobile ? '12px' : '24px' }}
                    >
                        {tournamentsLoading ? (
                            <Spin size="large" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }} />
                        ) : runningTournaments.length > 0 ? (
                            <List
                                dataSource={runningTournaments}
                                renderItem={(tournament) => (
                                    <List.Item
                                        style={{
                                            cursor: 'pointer',
                                            padding: isMobile ? '8px 12px' : '12px 16px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            marginBottom: '8px',
                                            transition: 'all 0.3s',
                                            position: 'relative',
                                            backgroundColor: 'var(--card-bg)'
                                        }}
                                        onClick={() => handleTournamentClick(tournament)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--card-target)';
                                            e.currentTarget.style.borderColor = 'var(--border-color)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                                            e.currentTarget.style.borderColor = 'var(--border-color)';
                                        }}
                                    >
                                        {/* Кнопки управления турниром (десктоп) */}
                                        {!isMobile && (
                                            <>
                                                <Button
                                                    icon={<TeamOutlined />}
                                                    type="text"
                                                    size="large"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        right: '48px',
                                                        zIndex: 30,
                                                        color: 'var(--text-color)'
                                                    }}
                                                    onClick={(e) => handleManagePlayers(tournament, e)}
                                                    onMouseEnter={(e) => e.stopPropagation()}
                                                />

                                                <Button
                                                    icon={<EditOutlined />}
                                                    type="text"
                                                    size="large"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        right: '8px',
                                                        zIndex: 30,
                                                        color: 'var(--text-color)'
                                                    }}
                                                    onClick={(e) => handleEditTournament(tournament, e)}
                                                    onMouseEnter={(e) => e.stopPropagation()}
                                                />
                                            </>
                                        )}

                                        {/* Кнопка удаления турнира */}
                                        <Popconfirm
                                            title="Удалить турнир?"
                                            description="Вы уверены, что хотите удалить этот турнир? Это действие нельзя отменить."
                                            okText="Да"
                                            cancelText="Нет"
                                            onConfirm={(e) => {
                                                e?.stopPropagation();
                                                handleDeleteTournament(tournament.id);
                                            }}
                                            onCancel={(e) => e?.stopPropagation()}
                                        >
                                            <Button
                                                icon={<DeleteOutlined />}
                                                type="text"
                                                danger
                                                size={isMobile ? "small" : "large"}
                                                style={{
                                                    position: 'absolute',
                                                    top: isMobile ? '32px' : '40px',
                                                    right: isMobile ? '8px' : '8px',
                                                    zIndex: 30
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Popconfirm>

                                        <List.Item.Meta
                                            title={
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                                                    marginRight: isMobile ? '40px' : '0'
                                                }}>
                                                    <Text strong style={{
                                                        color: 'var(--text-color)',
                                                        fontSize: isMobile ? '14px' : '16px'
                                                    }}>
                                                        {tournament.name}
                                                    </Text>
                                                    {getStageTag(tournament.stage)}
                                                    <Tag
                                                        color='red'
                                                        style={{
                                                            color: 'var(--text-color)',
                                                            borderColor: 'var(--border-color)',
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            margin: isMobile ? '2px 0' : '0'
                                                        }}
                                                    >
                                                        {tournament.players?.length || 0} игроков
                                                    </Tag>
                                                    <Tag
                                                        color="green"
                                                        style={{
                                                            color: 'blue',
                                                            borderColor: 'blue',
                                                            fontSize: isMobile ? '11px' : '12px'
                                                        }}
                                                    >
                                                        Раунд: {tournament.currentRound}/{tournament.amountOfRounds}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <div style={{ marginTop: isMobile ? '8px' : '0' }}>
                                                    <Text style={{
                                                        color: 'var(--text-secondary)',
                                                        fontSize: isMobile ? '12px' : '14px'
                                                    }}>
                                                        Дата: {dayjs(tournament.startDateTime).format('DD.MM.YYYY HH:mm')}
                                                    </Text>
                                                    {tournament.address && (
                                                        <div style={{ marginTop: '4px' }}>
                                                            <Space size="small" wrap>
                                                                <EnvironmentOutlined style={{
                                                                    color: 'var(--accent-color)',
                                                                    fontSize: isMobile ? '12px' : '14px'
                                                                }} />
                                                                <Text style={{
                                                                    color: 'var(--text-secondary)',
                                                                    fontSize: isMobile ? '12px' : '14px'
                                                                }}>
                                                                    {tournament.address}
                                                                </Text>
                                                            </Space>
                                                        </div>
                                                    )}
                                                    {tournament.description && (
                                                        <div style={{ marginTop: '4px' }}>
                                                            <Text style={{
                                                                color: 'var(--text-secondary)',
                                                                fontSize: isMobile ? '12px' : '14px'
                                                            }}>
                                                                {tournament.description.length > 50 && isMobile
                                                                    ? `${tournament.description.substring(0, 50)}...`
                                                                    : tournament.description
                                                                }
                                                            </Text>
                                                        </div>
                                                    )}
                                                    <div style={{ marginTop: '4px' }}>
                                                        <Text style={{
                                                            color: 'var(--text-secondary)',
                                                            fontSize: isMobile ? '11px' : '12px'
                                                        }}>
                                                            ID: {tournament.id}
                                                        </Text>
                                                    </div>
                                                    {isMobile && (
                                                        <div
                                                            style={{
                                                                marginTop: '10px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '8px'
                                                            }}
                                                        >
                                                            <Button
                                                                icon={<TeamOutlined />}
                                                                type="primary"
                                                                size="middle"
                                                                block
                                                                onClick={(e) => handleManagePlayers(tournament, e)}
                                                            >
                                                                Управление игроками
                                                            </Button>
                                                            <Button
                                                                icon={<EditOutlined />}
                                                                size="middle"
                                                                block
                                                                onClick={(e) => handleEditTournament(tournament, e)}
                                                            >
                                                                Изменить турнир
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Text style={{ color: 'var(--text-secondary)' }}>Нет активных турниров</Text>
                        )}
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <span style={{ color: 'var(--text-color)' }}>
                            <PlusOutlined />
                            {isMobile ? 'Создать' : 'Создание турнира'}
                        </span>
                    }
                    key="creation"
                >
                    <Card
                        title={<span style={{ color: 'var(--text-color)', fontSize: isMobile ? '16px' : '18px' }}>Создание нового турнира</span>}
                        bordered={false}
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)'
                        }}
                        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            initialValues={{
                                systemType: 'SWISS'
                            }}
                        >
                            <Row gutter={isMobile ? 8 : 16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="name"
                                        label={<span style={{ color: 'var(--text-color)' }}>Название турнира</span>}
                                        rules={[{ required: true, message: 'Введите название турнира' }]}
                                    >
                                        <Input
                                            placeholder="Введите название"
                                            size={isMobile ? "small" : "middle"}
                                            style={{
                                                backgroundColor: 'var(--card-bg)',
                                                color: 'var(--text-color)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="startDateTime"
                                        label={<span style={{ color: 'var(--text-color)' }}>Дата и время начала</span>}
                                        rules={[{ required: true, message: 'Выберите дату и время' }]}
                                    >
                                        <DatePicker
                                            showTime
                                            format="YYYY-MM-DD HH:mm"
                                            style={{
                                                width: '100%',
                                                backgroundColor: 'var(--card-bg)',
                                                color: 'var(--text-color)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            size={isMobile ? "small" : "middle"}
                                            placeholder="Выберите дату и время"
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="address"
                                label={<span style={{ color: 'var(--text-color)' }}>Адрес проведения</span>}
                                rules={[{ required: true, message: 'Введите адрес проведения турнира' }]}
                            >
                                <Input
                                    placeholder="Введите адрес проведения турнира"
                                    prefix={<EnvironmentOutlined style={{ color: 'var(--text-secondary)' }} />}
                                    size={isMobile ? "small" : "middle"}
                                    style={{
                                        backgroundColor: 'var(--card-bg)',
                                        color: 'var(--text-color)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label={<span style={{ color: 'var(--text-color)' }}>Описание турнира</span>}
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Введите описание турнира (необязательно)"
                                    size={isMobile ? "small" : "middle"}
                                    style={{
                                        backgroundColor: 'var(--card-bg)',
                                        color: 'var(--text-color)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                />
                            </Form.Item>

                            <Row gutter={isMobile ? 8 : 16}>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="minAmountOfPlayers"
                                        label={<span style={{ color: 'var(--text-color)' }}>Мин. игроков</span>}
                                        rules={[{ required: true, message: 'Введите минимальное количество' }]}
                                    >
                                        <InputNumber
                                            min={2}
                                            max={100}
                                            style={{ width: '100%' }}
                                            size={isMobile ? "small" : "middle"}
                                            placeholder="Минимум"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="maxAmountOfPlayers"
                                        label={<span style={{ color: 'var(--text-color)' }}>Макс. игроков</span>}
                                        rules={[{ required: true, message: 'Введите максимальное количество' }]}
                                    >
                                        <InputNumber
                                            min={2}
                                            max={100}
                                            style={{ width: '100%' }}
                                            size={isMobile ? "small" : "middle"}
                                            placeholder="Максимум"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="amountOfRounds"
                                        label={<span style={{ color: 'var(--text-color)' }}>Раунды</span>}
                                        rules={[{ required: true, message: 'Введите количество раундов' }]}
                                    >
                                        <InputNumber
                                            min={1}
                                            max={20}
                                            style={{ width: '100%' }}
                                            size={isMobile ? "small" : "middle"}
                                            placeholder="Раунды"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={isMobile ? 8 : 16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="systemType"
                                        label={<span style={{ color: 'var(--text-color)' }}>Тип жеребьёвки</span>}
                                        rules={[{ required: true, message: 'Выберите тип жеребьёвки' }]}
                                    >
                                        <Select
                                            size={isMobile ? "small" : "middle"}
                                            style={{ width: '100%' }}
                                        >
                                            <Select.Option value="SWISS">Швейцарская система</Select.Option>
                                            <Select.Option value="ROUND_ROBIN">Круговая (каждый с каждым)</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<PlusOutlined />}
                                    loading={loading}
                                    size={isMobile ? "middle" : "large"}
                                    style={{
                                        backgroundColor: 'var(--hover-color)',
                                        borderColor: 'var(--hover-color)',
                                        width: isMobile ? '100%' : 'auto'
                                    }}
                                >
                                    Создать турнир
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <span style={{ color: 'var(--text-color)' }}>
                            <UserAddOutlined />
                            {isMobile ? 'Админ' : 'Назначить админа'}
                        </span>
                    }
                    key="admin-assign"
                >
                    <Card
                        title={<span style={{ color: 'var(--text-color)', fontSize: isMobile ? '16px' : '18px' }}>Назначение администратора</span>}
                        bordered={false}
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)',
                            maxWidth: '500px',
                            margin: '0 auto'
                        }}
                        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
                    >
                        <Form
                            form={adminForm}
                            layout="vertical"
                            onFinish={onAssignAdmin}
                            autoComplete="off"
                        >
                            <Form.Item
                                name="username"
                                label={<span style={{ color: 'var(--text-color)' }}>Логин пользователя</span>}
                                rules={[{
                                    required: true,
                                    message: 'Введите логин пользователя'
                                }]}
                            >
                                <Input
                                    placeholder="Введите логин пользователя"
                                    prefix={<UserOutlined style={{ color: 'var(--text-secondary)' }} />}
                                    size={isMobile ? "small" : "middle"}
                                    style={{
                                        backgroundColor: 'var(--card-bg)',
                                        color: 'var(--text-color)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={adminLoading}
                                    size={isMobile ? "middle" : "large"}
                                    style={{
                                        backgroundColor: 'var(--hover-color)',
                                        borderColor: 'var(--hover-color)',
                                        width: '100%'
                                    }}
                                >
                                    Назначить администратором
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{
                            marginTop: '20px',
                            padding: '12px',
                            backgroundColor: 'var(--bg-color)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                💡 После назначения пользователь получит права администратора и доступ к этой панели управления.
                            </Text>
                        </div>
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <span style={{ color: 'var(--text-color)' }}>
            <TeamOutlined />
                            {isMobile ? 'Пользователи' : 'Управление пользователями'}
        </span>
                    }
                    key="users"
                >
                    <Card
                        title={<span style={{ color: 'var(--text-color)', fontSize: isMobile ? '16px' : '18px' }}>Управление пользователями</span>}
                        bordered={false}
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)'
                        }}
                        bodyStyle={{ padding: isMobile ? '12px' : '24px' }}
                        extra={
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => fetchUsers(pagination.current, pagination.pageSize)}
                                size={isMobile ? "small" : "middle"}
                                style={{
                                    color: 'var(--text-color)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                Обновить
                            </Button>
                        }
                    >
                        <List
                            dataSource={users}
                            loading={usersLoading}
                            pagination={{
                                ...pagination,
                                onChange: (page, pageSize) => {
                                    fetchUsers(page, pageSize);
                                },
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '20', '50'],
                                showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} пользователей`,
                                style: { marginBottom: 0 }
                            }}
                            renderItem={(user) => (
                                <List.Item
                                    style={{
                                        padding: isMobile ? '8px 12px' : '12px 16px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        marginBottom: '8px',
                                        backgroundColor: 'var(--card-bg)'
                                    }}
                                    actions={[
                                        <Popconfirm
                                            title="Удалить пользователя?"
                                            description="Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить."
                                            okText="Да"
                                            cancelText="Нет"
                                            onConfirm={() => handleDeleteUser(user.id)}
                                        >
                                            <Button
                                                icon={<DeleteOutlined />}
                                                type="text"
                                                danger
                                                size={isMobile ? "small" : "middle"}
                                            />
                                        </Popconfirm>,
                                        user.banned ? (
                                            <Popconfirm
                                                title="Разбанить пользователя?"
                                                description="Вы уверены, что хотите разбанить этого пользователя?"
                                                okText="Да"
                                                cancelText="Нет"
                                                onConfirm={() => handleUnbanUser(user.id)}
                                            >
                                                <Button
                                                    type="primary"
                                                    size={isMobile ? "small" : "middle"}
                                                    style={{
                                                        backgroundColor: '#52c41a',
                                                        borderColor: '#52c41a'
                                                    }}
                                                >
                                                    Разбанить
                                                </Button>
                                            </Popconfirm>
                                        ) : (
                                            <Button
                                                type="primary"
                                                danger
                                                size={isMobile ? "small" : "middle"}
                                                onClick={() => openBanModal(user)}
                                            >
                                                Забанить
                                            </Button>
                                        )
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Text strong style={{ color: 'var(--text-color)' }}>
                                                    {user.username}
                                                </Text>
                                                {user.banned && (
                                                    <Tag color="red">Забанен</Tag>
                                                )}
                                                {user.roles && user.roles.includes('ADMIN') && (
                                                    <Tag color="gold">Админ</Tag>
                                                )}
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <div>
                                                    <Text style={{ color: 'var(--text-secondary)' }}>
                                                        {user.fullName}
                                                    </Text>
                                                </div>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Space size="small" wrap>
                                                        <Tag
                                                            color="blue"
                                                            style={{
                                                                borderColor: 'var(--border-color)',
                                                                fontSize: isMobile ? '11px' : '12px'
                                                            }}
                                                        >
                                                            Рейтинг: {user.rating}
                                                        </Tag>
                                                        <Tag
                                                            color="green"
                                                            style={{
                                                                borderColor: 'var(--border-color)',
                                                                fontSize: isMobile ? '11px' : '12px'
                                                            }}
                                                        >
                                                            Матчей: {user.amountOfMatches}
                                                        </Tag>
                                                        {user.email && (
                                                            <Tag
                                                                style={{
                                                                    borderColor: 'var(--border-color)',
                                                                    fontSize: isMobile ? '11px' : '12px'
                                                                }}
                                                            >
                                                                {user.email}
                                                            </Tag>
                                                        )}
                                                        {user.phoneNumber && (
                                                            <Tag
                                                                style={{
                                                                    borderColor: 'var(--border-color)',
                                                                    fontSize: isMobile ? '11px' : '12px'
                                                                }}
                                                            >
                                                                {user.phoneNumber}
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                </div>
                                                {user.banned && user.unbanDate && (
                                                    <div style={{ marginTop: '8px' }}>
                                                        <Text type="secondary" style={{ fontSize: isMobile ? '11px' : '12px' }}>
                                                            Разбан: {dayjs(user.unbanDate).format('DD.MM.YYYY HH:mm')}
                                                        </Text>
                                                    </div>
                                                )}
                                                {user.banned && !user.unbanDate && (
                                                    <div style={{ marginTop: '8px' }}>
                                                        <Text type="secondary" style={{ fontSize: isMobile ? '11px' : '12px' }}>
                                                            Перманентный бан
                                                        </Text>
                                                    </div>
                                                )}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </TabPane>
            </Tabs>
            <Modal
                title="Бан пользователя"
                open={banModalVisible}
                onCancel={() => {
                    setBanModalVisible(false);
                    setSelectedUser(null);
                    setBanDuration(null);
                }}
                footer={[
                    <Button key="cancel" onClick={() => {
                        setBanModalVisible(false);
                        setSelectedUser(null);
                        setBanDuration(null);
                    }}>
                        Отмена
                    </Button>,
                    <Button
                        key="permanent"
                        danger
                        onClick={() => handleBanUser(selectedUser?.id)}
                    >
                        Перманентный бан
                    </Button>,
                    <Button
                        key="temporary"
                        type="primary"
                        danger
                        onClick={() => handleBanUser(selectedUser?.id, banDuration)}
                        disabled={!banDuration || banDuration <= 0}
                    >
                        Временный бан ({banDuration} дней)
                    </Button>
                ]}
            >
                {selectedUser && (
                    <div>
                        <Text>
                            Вы хотите забанить пользователя <Text strong>{selectedUser.username}</Text>?
                        </Text>
                        <div style={{ marginTop: '16px' }}>
                            <Form layout="vertical">
                                <Form.Item label="Количество дней (оставьте пустым для перманентного бана)">
                                    <InputNumber
                                        min={1}
                                        max={365}
                                        style={{ width: '100%' }}
                                        value={banDuration}
                                        onChange={setBanDuration}
                                        placeholder="Введите количество дней"
                                    />
                                </Form.Item>
                                {banDuration && (
                                    <Text type="secondary">
                                        Пользователь будет забанен до: {dayjs().add(banDuration, 'day').format('DD.MM.YYYY HH:mm')}
                                    </Text>
                                )}
                            </Form>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminPage;
