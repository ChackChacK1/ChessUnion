import { Card, Image, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const HomePage = () => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            minHeight: '100vh',
            background: 'var(--bg-color)'
        }}>
            <Title
                level={1}
                style={{
                    color: 'var(--text-color)',
                    marginBottom: '16px',
                    fontWeight: 700,
                    fontSize: '2.5rem'
                }}
            >
                Добро пожаловать в ChessUnion!
            </Title>

            <Paragraph
                style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1.1rem',
                    marginBottom: '40px',
                    maxWidth: '600px',
                    margin: '0 auto 40px'
                }}
            >
                Платформа для организации шахматных турниров и сообщество любителей шахмат
            </Paragraph>

            <Card
                style={{
                    maxWidth: 800,
                    margin: '0 auto',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow)',
                    overflow: 'hidden'
                }}
                bodyStyle={{ padding: 0 }}
            >

                {/*<Image*/}
                {/*    src="src/images/sorryyourenotasigma..webp"*/}
                {/*    preview={false}*/}
                {/*    alt="Шахматная доска"*/}
                {/*    style={{*/}
                {/*        width: '100%',*/}
                {/*        height: 'auto',*/}
                {/*        display: 'block'*/}
                {/*    }}*/}
                {/*/>*/}

                <div style={{ padding: '24px' }}>
                    <Title level={3} style={{ color: 'var(--text-color)', marginBottom: '16px' }}>
                        Начните играть уже сегодня!
                    </Title>
                    <Paragraph style={{ color: 'var(--text-secondary)' }}>
                        Присоединяйтесь к нашему сообществу, участвуйте в турнирах
                        и улучшайте свои шахматные навыки вместе с нами.
                    </Paragraph>
                </div>
            </Card>
        </div>
    );
};

export default HomePage;