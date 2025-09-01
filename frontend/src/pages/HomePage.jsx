import { Card, Image, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const HomePage = () => {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <Title level={2}>Добро пожаловать в ChessUnion!</Title>
            <Paragraph>Платформа для организации шахматных турниров</Paragraph>
            <Card style={{ maxWidth: 800, margin: '0 auto' }}>
                <Image
                    src="src/images/sorryyourenotasigma..webp"
                    preview={false}
                    alt="Chess Background"
                />
            </Card>
        </div>
    );
};

export default HomePage;