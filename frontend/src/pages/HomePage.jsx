import { Card, Image, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const HomePage = () => {
    return (
        <div className="home-hero">
            <Title
                level={1}
                style={{
                    color: 'var(--text-color)',
                    marginBottom: '16px',
                    fontWeight: 700,
                    fontSize: 'clamp(1.6rem, 5vw, 2.5rem)'
                }}
            >
                ChessUnion — шахматный клуб в Сочи
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
                ChessUnion — клуб для любителей шахмат в Сочи. Мы объединяем взрослых и детей, проводим регулярные турниры, тренировки, дружеские встречи и поддерживаем сообщество, в котором каждый растёт и играет с удовольствием.
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

                <div style={{ padding: '24px' }}>
                    <Title level={3} style={{ color: 'var(--text-color)', marginBottom: '16px' }}>
                        Добро пожаловать в сообщество ChessUnion
                    </Title>
                    <Paragraph style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                        Приходите на наши встречи и участвуйте в турнирах. Мы рады новичкам и сильным игрокам — подберём соперников по уровню и поможем прогрессировать.
                    </Paragraph>

                    {/* Галерея клуба. Положите изображения в frontend/src/images/ с именами ниже */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 16,
                        marginBottom: 24
                    }}>
                        <Image src="/src/images/chessunion_tournament.jpg" alt="Турнир ChessUnion" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                        <Image src="/src/images/union_logo.jpg" alt="Логотип ChessUnion" style={{ width: '100%', height: 200, objectFit: 'cover', background: 'var(--bg-color)' }} />
                        <Image src="/src/images/chessunion_club_bw.jpg" alt="Клуб ChessUnion" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                    </div>

                    <Paragraph style={{ color: 'var(--text-secondary)' }}>
                        Подписывайтесь на наш Telegram, чтобы не пропускать анонсы турниров, расписание занятий и фотоотчёты.
                    </Paragraph>
                    <a
                        className="tg-button"
                        href="https://t.me/UnionSochy"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Мы в Telegram"
                    >
                        <img
                            className="tg-icon"
                            src="/src/images/telegram_icon-icons.com_72055.png"
                            alt="Telegram"
                        />
                        <span>Мы в Telegram</span>
                    </a>
                </div>



            </Card>
        </div>
    );
};

export default HomePage;