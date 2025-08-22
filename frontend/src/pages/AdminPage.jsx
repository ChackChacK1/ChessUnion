import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, DatePicker, InputNumber, message, Typography, Row, Col, List, Tabs, Tag, Spin } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
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

    // Загрузка активных турниров
    const fetchRunningTournaments = async () => {
        try {
            setTournamentsLoading(true);
            const response = await client.get('/api/admin/tournament/running');
            // API возвращает просто массив, а не объект с пагинацией
            setRunningTournaments(response.data || []);
        } catch (error) {
            message.error('Ошибка загрузки турниров: ' + error.response?.data?.message || error.message);
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
                description: values.description,
                startDateTime: values.startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
                maxAmountOfPlayers: values.maxAmountOfPlayers,
                minAmountOfPlayers: values.minAmountOfPlayers
            };

            await client.post('/api/admin/tournament/create', tournamentData);
            message.success('Турнир успешно создан!');
            form.resetFields();
            fetchRunningTournaments(); // Обновляем список после создания

        } catch (error) {
            message.error('Ошибка создания турнира: ' + error.response?.data?.message || error.message);
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

    const handleTournamentClick = (tournamentId) => {
        navigate(`/admin/tournament/${tournamentId}/0`); // меняем на /0 для текущего раунда
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Title level={2}>Панель администратора</Title>

            <Tabs defaultActiveKey="management" type="card">
                <TabPane
                    tab={
                        <span>
                            <SettingOutlined />
                            Управление турнирами
                        </span>
                    }
                    key="management"
                >
                    <Card title="Активные турниры" bordered={false}>
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
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '6px',
                                            marginBottom: '8px',
                                            transition: 'all 0.3s'
                                        }}
                                        onClick={() => handleTournamentClick(tournament.id)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                                            e.currentTarget.style.borderColor = '#1890ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '';
                                            e.currentTarget.style.borderColor = '#d9d9d9';
                                        }}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Text strong>{tournament.name}</Text>
                                                    {getStageTag(tournament.stage)}
                                                    <Tag color="cyan">{tournament.players?.length || 0} игроков</Tag>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <Text type="secondary">
                                                        Дата проведения: {dayjs(tournament.startDateTime).format('DD.MM.YYYY HH:mm')}
                                                    </Text>
                                                    {tournament.description && (
                                                        <div style={{ marginTop: '4px' }}>
                                                            <Text type="secondary">{tournament.description}</Text>
                                                        </div>
                                                    )}
                                                    <div style={{ marginTop: '4px' }}>
                                                        <Text type="secondary">
                                                            ID: {tournament.id} • Раунд: {tournament.currentRound}
                                                        </Text>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Text type="secondary">Нет активных турниров</Text>
                        )}
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <PlusOutlined />
                            Создание турнира
                        </span>
                    }
                    key="creation"
                >
                    <Card title="Создание нового турнира" bordered={false}>
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
                                        label="Название турнира"
                                        rules={[{ required: true, message: 'Введите название турнира' }]}
                                    >
                                        <Input placeholder="Введите название" />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        name="startDateTime"
                                        label="Дата и время начала"
                                        rules={[{ required: true, message: 'Выберите дату и время' }]}
                                    >
                                        <DatePicker
                                            showTime
                                            format="YYYY-MM-DD HH:mm"
                                            style={{ width: '100%' }}
                                            placeholder="Выберите дату и время"
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="description"
                                label="Описание турнира"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Введите описание турнира (необязательно)"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="minAmountOfPlayers"
                                        label="Минимальное количество игроков"
                                        rules={[{ required: true, message: 'Введите минимальное количество' }]}
                                    >
                                        <InputNumber
                                            min={2}
                                            max={100}
                                            style={{ width: '100%' }}
                                            placeholder="Минимум игроков"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        name="maxAmountOfPlayers"
                                        label="Максимальное количество игроков"
                                        rules={[{ required: true, message: 'Введите максимальное количество' }]}
                                    >
                                        <InputNumber
                                            min={2}
                                            max={100}
                                            style={{ width: '100%' }}
                                            placeholder="Максимум игроков"
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