import { Card, Image, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const highlightCards = [
    {
        title: 'Турниры каждого формата',
        description: 'Классика, рапид и блиц с профессиональным контролем времени и судейством.',
        icon: '♔'
    },
    {
        title: 'Детские и взрослые группы',
        description: 'Гибкие группы по уровню: от первых шагов до подготовки к разрядам.',
        icon: '♗'
    },
    {
        title: 'Тренерский штаб',
        description: 'Тренеры с опытом ФШР помогают расти стратегически и психологически.',
        icon: '♘'
    },
    {
        title: 'Живое комьюнити',
        description: 'Открытые лекции, анализ партий и уютные встречи клуба в центре Сочи.',
        icon: '♙'
    }
];

const galleryImages = [
    {
        src: '/src/images/chessunion_tournament.jpg',
        alt: 'Турнир ChessUnion',
        caption: 'Спортивные выходные и рейтинговые встречи'
    },
    {
        src: '/src/images/union_logo.jpg',
        alt: 'Логотип ChessUnion',
        caption: 'Фирменный стиль и атрибутика клуба'
    },
    {
        src: '/src/images/chessunion_club_bw.jpg',
        alt: 'Клуб ChessUnion',
        caption: 'Уютный клубный зал в самом центре Сочи'
    }
];

const HomePage = () => {
    return (
        <main className="home-hero">
            <section className="hero-grid">
                <div className="hero-copy">
                    <span className="eyebrow">Union • Сочи</span>
                    <Title level={1} className="hero-title">
                        Шахматный клуб для тех, кто живёт партиями
                        <span className="title-accent" aria-label="Chess Union">
                            Un
                            <span className="pawn-letter" role="img" aria-label="шахматная пешка">♙</span>
                            on
                        </span>
                    </Title>
                    <Paragraph className="hero-lead">
                        Мы соединяем шахматистов, тренеров и семьи в дружелюбное сообщество. Турниры, тренировки, лекции и камерные вечера — всё, чтобы вы чувствовали прогресс и азарт каждой партии.
                    </Paragraph>

                    <div className="hero-cta">
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
                        <a className="outline-button" href="/tournaments">
                            Расписание турниров
                        </a>
                    </div>

                </div>

                <div className="hero-visual">
                    <div className="chessboard-frame">
                        <span className="pivot-note">А ты записался на турнир?</span>
                        <Image
                            src="/src/images/ruslan.jpg"
                            alt="Зал ChessUnion"
                            preview={false}
                            className="hero-image"
                        />
                        <div className="board-overlay">
                            <div className="overlay-item">
                                <span className="overlay-title">Live-аналитика</span>
                                <span className="overlay-text">совместные разборы партий</span>
                            </div>
                            <div className="overlay-item">
                                <span className="overlay-title">Кубки и рейтинги</span>
                                <span className="overlay-text">Призовые турниры с обсчетом рейтинга</span>
                            </div>
                        </div>
                    </div>
                    <ul className="hero-pill-list">
                        <li>Блиц-вечера с гостями</li>
                        <li>Турниры каждые выходные</li>
                        <li>Занятия с опытными тренерами</li>
                    </ul>
                </div>
            </section>

            <section className="hero-card-grid">
                {highlightCards.map(({ title, description, icon }) => (
                    <Card
                        key={title}
                        className="hero-card"
                        bordered={false}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <span className="card-icon" aria-hidden="true">{icon}</span>
                        <Title level={4} className="card-title">
                            {title}
                        </Title>
                        <Paragraph className="card-text">{description}</Paragraph>
                    </Card>
                ))}
            </section>

            <section className="gallery-section">
                <div className="section-heading">
                    <span className="eyebrow">Живая атмосфера</span>
                    <Title level={3}>Так выглядит ChessUnion изнутри</Title>
                    <Paragraph className="section-subtitle">
                        Мы делимся каждым событием — от тренировок и мастер-классов до больших фестивалей. Присоединяйтесь и станьте частью хроники клуба.
                    </Paragraph>
                </div>
                <div className="gallery-grid">
                    {galleryImages.map(({ src, alt, caption }) => (
                        <figure key={alt} className="gallery-figure">
                            <Image src={src} alt={alt} preview={false} className="gallery-image" />
                            <figcaption className="gallery-caption">{caption}</figcaption>
                        </figure>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default HomePage;