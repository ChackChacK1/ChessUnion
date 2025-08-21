import { useState } from 'react';
import { Card, Form, Input, Button, DatePicker, InputNumber, message, Typography, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import client from '../api/client';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const AdminPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

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

        } catch (error) {
            message.error('Ошибка создания турнира: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Title level={2}>Панель администратора</Title>

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
                            rows={4}
                            placeholder="Введите описание турнира (необязательно)"
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="minAmountOfPlayers"
                                label="Минимальное количество игроков"
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

            <Card title="Другие действия" style={{ marginTop: 20 }}>
                <p>Здесь будут другие админ-функции:</p>
                <ul>
                    <li>Управление результатами матчей</li>
                    <li>Генерация новых раундов</li>
                    <li>Просмотр результатов турниров</li>
                </ul>
            </Card>
        </div>
    );
};

export default AdminPage;