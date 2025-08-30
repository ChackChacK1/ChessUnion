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
    Col
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
                const tournamentData = response.data.body; // Достаем данные из body

                console.log('Tournament data:', tournamentData); // Для отладки

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

    if (fetching) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
                <Text style={{ marginLeft: 10 }}>Загрузка данных турнира...</Text>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <Text>Турнир не найден</Text>
                <br />
                <Button onClick={handleCancel} style={{ marginTop: 10 }}>
                    Вернуться назад
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Card>
                <Space style={{ marginBottom: 20, alignItems: 'center' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleCancel}
                        type="text"
                    />
                    <Title level={4} style={{ margin: 0 }}>
                        Редактирование турнира: {tournament.name}
                    </Title>
                </Space>

                {/* Информация о текущем состоянии */}
                <div style={{ marginBottom: 20, padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                    <Text strong>Текущая информация:</Text>
                    <br />
                    <Text>ID: {tournament.id}</Text>
                    <br />
                    <Text>Статус: {tournament.stage}</Text>
                    <br />
                    <Text>Текущий раунд: {tournament.currentRound + 1}</Text>
                    <br />
                    <Text>Зарегистрировано игроков: {tournament.players?.length || 0}</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    initialValues={{
                        name: tournament.name,
                        description: tournament.description || '',
                        startDateTime: dayjs(tournament.startDateTime),
                        maxAmountOfPlayers: tournament.maxAmountOfPlayers,
                        minAmountOfPlayers: tournament.minAmountOfPlayers,
                        amountOfRounds: tournament.amountOfRounds
                    }}
                >
                    <Form.Item
                        label="Название турнира"
                        name="name"
                        rules={[{ required: true, message: 'Введите название турнира' }]}
                    >
                        <Input placeholder="Введите название турнира" />
                    </Form.Item>

                    <Form.Item
                        label="Описание турнира"
                        name="description"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Введите описание турнира"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Дата и время начала"
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
                                label="Минимальное количество игроков"
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
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                label="Максимальное количество игроков"
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
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                label="Количество раундов"
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
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Сохранить изменения
                            </Button>
                            <Button onClick={handleCancel}>
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