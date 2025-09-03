import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    message,
    Space,
    DatePicker,
    InputNumber,
    Spin,
    Row,
    Col,
    Tag
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const EditTournament = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tournament, setTournament] = useState(null);
    const [fetching, setFetching] = useState(true);
    const navigate = useNavigate();
    const { tournamentId } = useParams();

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await client.get(`/api/tournament/${tournamentId}`);

                // Исправление: проверяем разные форматы ответа
                let tournamentData = response.data;

                // Если данные в поле body
                if (response.data && response.data.body) {
                    tournamentData = response.data.body;
                }
                // Если это прямой объект
                else if (response.data && response.data.id) {
                    tournamentData = response.data;
                }

                console.log('Tournament data:', tournamentData); // Для отладки

                if (!tournamentData || !tournamentData.id) {
                    throw new Error('Турнир не найден');
                }

                setTournament(tournamentData);

                // Заполняем форму данными турнира
                form.setFieldsValue({
                    name: tournamentData.name,
                    description: tournamentData.description || '',
                    startDateTime: dayjs(tournamentData.startDateTime),
                    maxAmountOfPlayers: tournamentData.maxAmountOfPlayers,
                    minAmountOfPlayers: tournamentData.minAmountOfPlayers,
                    amountOfRounds: tournamentData.amountOfRounds
                });
            } catch (error) {
                console.error('Error fetching tournament:', error);
                message.error('Ошибка загрузки турнира: ' + (error.response?.data?.message || error.message));
            } finally {
                setFetching(false);
            }
        };

        if (tournamentId) {
            fetchTournament();
        }
    }, [tournamentId, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const tournamentData = {
                name: values.name,
                description: values.description,
                startDateTime: values.startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
                maxAmountOfPlayers: values.maxAmountOfPlayers,
                minAmountOfPlayers: values.minAmountOfPlayers,
                amountOfRounds: values.amountOfRounds
            };

            await client.patch(`/api/admin/tournament/${tournamentId}/update`, tournamentData);
            message.success('Турнир успешно обновлен');
            navigate('/admin');
        } catch (error) {
            console.error('Error updating tournament:', error);
            const errorMessage = error.response?.data?.message || error.message;
            message.error('Ошибка обновления: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin');
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

    if (fetching) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
                <Text style={{ marginLeft: 10, color: 'var(--text-color)' }}>Загрузка данных турнира...</Text>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <Text style={{ color: 'var(--text-color)' }}>Турнир не найден</Text>
                <br />
                <Button
                    onClick={handleCancel}
                    style={{ marginTop: 10 }}
                >
                    Вернуться назад
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Card
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
            >
                <Space style={{ marginBottom: 20, alignItems: 'center' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleCancel}
                        type="text"
                        style={{ color: 'var(--text-color)' }}
                    />
                    <Title level={4} style={{ margin: 0, color: 'var(--text-color)' }}>
                        Редактирование турнира: {tournament.name}
                    </Title>
                </Space>

                {/* Информация о текущем состоянии */}
                <div style={{
                    marginBottom: 20,
                    padding: '15px',
                    backgroundColor: 'var(--bg-color)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)'
                }}>
                    <Text strong style={{ color: 'var(--text-color)' }}>Текущая информация:</Text>
                    <br />
                    <Text style={{ color: 'var(--text-color)' }}>ID: {tournament.id}</Text>
                    <br />
                    <Text style={{ color: 'var(--text-color)' }}>
                        Статус: <Tag color={getStageColor(tournament.stage)}>
                        {translateStage(tournament.stage)}
                    </Tag>
                    </Text>
                    <br />
                    <Text style={{ color: 'var(--text-color)' }}>Текущий раунд: {tournament.currentRound + 1}</Text>
                    <br />
                    <Text style={{ color: 'var(--text-color)' }}>Зарегистрировано игроков: {tournament.players?.length || 0}</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        label={<span style={{ color: 'var(--text-color)' }}>Название турнира</span>}
                        name="name"
                        rules={[{ required: true, message: 'Введите название турнира' }]}
                    >
                        <Input
                            placeholder="Введите название турнира"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ color: 'var(--text-color)' }}>Описание турнира</span>}
                        name="description"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Введите описание турнира"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ color: 'var(--text-color)' }}>Дата и время начала</span>}
                        name="startDateTime"
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

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label={<span style={{ color: 'var(--text-color)' }}>Минимальное количество игроков</span>}
                                name="minAmountOfPlayers"
                                rules={[
                                    { required: true, message: 'Введите минимальное количество' },
                                    { type: 'number', min: 2, message: 'Минимум 2 игрока' }
                                ]}
                            >
                                <InputNumber
                                    min={2}
                                    max={100}
                                    style={{ width: '100%' }}
                                    placeholder="Минимум игроков"
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
                                label={<span style={{ color: 'var(--text-color)' }}>Максимальное количество игроков</span>}
                                name="maxAmountOfPlayers"
                                rules={[
                                    { required: true, message: 'Введите максимальное количество' },
                                    { type: 'number', min: 2, message: 'Минимум 2 игрока' }
                                ]}
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
                                label={<span style={{ color: 'var(--text-color)' }}>Количество раундов</span>}
                                name="amountOfRounds"
                                rules={[
                                    { required: true, message: 'Введите количество раундов' },
                                    { type: 'number', min: 1, message: 'Минимум 1 раунд' }
                                ]}
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
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{
                                    backgroundColor: 'var(--hover-color)',
                                    borderColor: 'var(--hover-color)'
                                }}
                            >
                                Сохранить изменения
                            </Button>
                            <Button
                                onClick={handleCancel}
                                style={{
                                    color: 'var(--text-color)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                Отмена
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditTournament;