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
    Space
} from 'antd';
import { PlusOutlined, SettingOutlined, EditOutlined, EnvironmentOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AdminPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [runningTournaments, setRunningTournaments] = useState([]);
    const [tournamentsLoading, setTournamentsLoading] = useState(false);
    const navigate = useNavigate();

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
                amountOfRounds: values.amountOfRounds
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

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Title level={2} style={{ color: 'var(--text-color)' }}>Панель администратора</Title>

            <Tabs
                defaultActiveKey="management"
                type="card"
                style={{ color: 'var(--text-color)'}}
            >
                <TabPane
                    tab={
                        <span style={{color: 'var(--text-color)'}}>
                            <SettingOutlined />
                            Управление турнирами
                        </span>
                    }
                    key="management"
                >
                    <Card
                        title={<span style={{ color: 'var(--text-color)' }}>Активные турниры</span>}
                        bordered={false}
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)'
                        }}
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
                                            padding: '12px 16px',
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
                                        <Button
                                            icon={<TeamOutlined />}
                                            type="text"
                                            size="large"
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '48px', // Смещаем правее, чтобы не перекрывать кнопку редактирования
                                                zIndex: 30,
                                                color: 'var(--text-color)'
                                            }}
                                            onClick={(e) => handleManagePlayers(tournament, e)}
                                            onMouseEnter={(e) => e.stopPropagation()}
                                        />
                                        {/* Кнопка редактирования */}
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

                                        <List.Item.Meta
                                            title={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Text strong style={{ color: 'var(--text-color)' }}>{tournament.name}</Text>
                                                    {getStageTag(tournament.stage)}
                                                    <Tag
                                                        color='var(--hover-color)'
                                                        style={{
                                                            color: 'var(--text-color)',
                                                            borderColor: 'var(--border-color)'
                                                        }}
                                                    >
                                                        {tournament.players?.length || 0} игроков
                                                    </Tag>
                                                    <Tag
                                                        color="orange"
                                                        style={{
                                                            color: 'var(--text-color)',
                                                            borderColor: 'var(--border-color)'
                                                        }}
                                                    >
                                                        Раунд: {tournament.currentRound + 1}/{tournament.amountOfRounds}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <Text style={{ color: 'var(--text-secondary)' }}>
                                                        Дата проведения: {dayjs(tournament.startDateTime).format('DD.MM.YYYY HH:mm')}
                                                    </Text>
                                                    {tournament.address && (
                                                        <div style={{ marginTop: '4px' }}>
                                                            <Space size="small">
                                                                <EnvironmentOutlined style={{ color: 'var(--accent-color)' }} />
                                                                <Text style={{ color: 'var(--text-secondary)' }}>{tournament.address}</Text>
                                                            </Space>
                                                        </div>
                                                    )}
                                                    {tournament.description && (
                                                        <div style={{ marginTop: '4px' }}>
                                                            <Text style={{ color: 'var(--text-secondary)' }}>{tournament.description}</Text>
                                                        </div>
                                                    )}
                                                    <div style={{ marginTop: '4px' }}>
                                                        <Text style={{ color: 'var(--text-secondary)' }}>
                                                            ID: {tournament.id}
                                                        </Text>
                                                    </div>
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
                            Создание турнира
                        </span>
                    }
                    key="creation"
                >
                    <Card
                        title={<span style={{ color: 'var(--text-color)' }}>Создание нового турнира</span>}
                        bordered={false}
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)'
                        }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="name"
                                        label={<span style={{ color: 'var(--text-color)' }}>Название турнира</span>}
                                        rules={[{ required: true, message: 'Введите название турнира' }]}
                                    >
                                        <Input
                                            placeholder="Введите название"
                                            style={{
                                                backgroundColor: 'var(--card-bg)',
                                                color: 'var(--text-color)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
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
                                            placeholder="Выберите дату и время"
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                            className="custom-date-picker"
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
                                    style={{
                                        backgroundColor: 'var(--card-bg)',
                                        color: 'var(--text-color)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="minAmountOfPlayers"
                                        label={<span style={{ color: 'var(--text-color)' }}>Минимальное количество игроков</span>}
                                        rules={[{ required: true, message: 'Введите минимальное количество' }]}
                                    >
                                        <InputNumber
                                            min={2}
                                            max={100}
                                            style={{
                                                width: '100%',
                                                backgroundColor: 'var(--card-bg)',
                                                color: 'var(--text-color)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            placeholder="Минимум игроков"
                                            controlsStyle={{
                                                backgroundColor: 'var(--card-bg)',
                                                color: 'var(--text-color)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            className="custom-input-number"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="maxAmountOfPlayers"
                                        label={<span style={{ color: 'var(--text-color)' }}>Максимальное количество игроков</span>}
                                        rules={[{ required: true, message: 'Введите максимальное количество' }]}
                                    >
                                        <InputNumber
                                            min={2}
                                            max={100}
                                            style={{ width: '100%' }}
                                            placeholder="Максимум игроков"
                                            controlsStyle={{
                                                backgroundColor: 'var(--card-bg)',
                                                color: 'var(--text-color)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="amountOfRounds"
                                        label={<span style={{ color: 'var(--text-color)' }}>Количество раундов</span>}
                                        rules={[{ required: true, message: 'Введите количество раундов' }]}
                                    >
                                        <InputNumber
                                            min={1}
                                            max={20}
                                            style={{ width: '100%' }}
                                            placeholder="Количество раундов"
                                            controlsStyle={{
                                                backgroundColor: 'var(--card-bg)',
                                                color: 'var(--text-color)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<PlusOutlined />}
                                    loading={loading}
                                    size="large"
                                    style={{
                                        backgroundColor: 'var(--hover-color)',
                                        borderColor: 'var(--hover-color)'
                                    }}
                                >
                                    Создать турнир
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default AdminPage;