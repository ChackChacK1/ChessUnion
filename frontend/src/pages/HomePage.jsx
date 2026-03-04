import { Card, Image, Typography } from 'antd';
import { Link } from 'react-router-dom';
import tournamentImg from '../images/chessunion_tournament.jpg';
import logoImg from '../images/union_logo.jpg';
import clubImg from '../images/chessunion_club_bw.jpg';

import tgIcon from '../images/telegram_icon-icons.com_72055.png';
import vkIcon from '../images/icons8-vk-48.png';
import maxIcon from '../images/Max_logo_2025.png';

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
        src: tournamentImg,
        alt: 'Турнир ChessUnion',
        caption: 'Спортивные выходные и рейтинговые встречи'
    },
    {
        src: logoImg,
        alt: 'Логотип ChessUnion',
        caption: 'Фирменный стиль и атрибутика клуба'
    },
    {
        src: clubImg,
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
                        Шахматный клуб в Сочи — турниры, обучение и рейтинги&nbsp;
                        <span className="title-accent" aria-label="Chess Union">
                            Un
                            <span className="pawn-letter" role="img" aria-label="шахматная пешка">♙</span>
                            on
                        </span>
                    </Title>
                    <Paragraph className="hero-lead">
                        UNION — это шахматный клуб в Сочи для детей и взрослых.
                        Мы проводим регулярные турниры, обучающие занятия с опытными тренерами,
                        рейтинговые соревнования и разборы партий в живом формате
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
                                src={tgIcon}
                                alt="Telegram"
                                loading="lazy"
                            />
                            <span>Мы в Telegram</span>
                        </a>
                        <Link className="outline-button" to="/tournaments">Расписание турниров</Link>
                    </div>

                    <div className="hero-cta">
                        <a
                            className="tg-button"
                            href="https://vk.ru/club236316961"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Мы в VK"
                        >
                            <img
                                className="tg-icon"
                                src={vkIcon}
                                alt="vk"
                                loading="lazy"
                            />
                            <span>Мы в VK</span>
                        </a>
                        <a
                            className="tg-button"
                            href="https://max.ru/join/705DRT_rLBowaFns6ebFlPvY0xqCKAjVAIE0gsmUpvk"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Мы в Max"
                        >
                            <img
                                className="tg-icon"
                                src={maxIcon}
                                alt="max"
                                loading="lazy"
                            />
                            <span>Мы в Max</span>
                        </a>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="chessboard-frame">
                        <span className="pivot-note">UNION</span>
                        <Image
                            src={clubImg}
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
                        <Title level={4} className="card-title">{title}</Title>
                        <Paragraph className="card-text">{description}</Paragraph>
                    </Card>
                ))}
            </section>

            <section className="gallery-section">
                <div className="section-heading">
                    <span className="eyebrow">Живая атмосфера</span>
                    <Title style={{ color: 'var(--text-color)' }} level={3}>
                        Так выглядит Union изнутри
                    </Title>
                    <Paragraph className="section-subtitle">
                        Мы делимся каждым событием — от тренировок и мастер-классов до больших фестивалей. Присоединяйтесь и станьте частью хроники клуба.
                    </Paragraph>
                </div>
                <div className="gallery-grid">
                    {galleryImages.map(({ src, alt, caption }) => (
                        <figure key={alt} className="gallery-figure">
                            <img 
                                src={src} 
                                alt={alt} 
                                className="gallery-image"
                                loading="lazy"
                            />
                            <figcaption className="gallery-caption">{caption}</figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            <section className="pricing-section">
                <div className="section-heading">
                    <span className="eyebrow">Услуги и цены</span>
                    <Title style={{ color: 'var(--text-color)' }} level={3}>
                        Наши тарифы
                    </Title>
                </div>
                <div className="pricing-grid">
                    <div className="pricing-card">
                        <div className="pricing-icon">♔</div>
                        <Title level={4} className="pricing-title">Шахматный турнир</Title>
                        <div className="pricing-price">500₽</div>
                    </div>
                    <div className="pricing-card">
                        <div className="pricing-icon">♗</div>
                        <Title level={4} className="pricing-title">Групповое обучение</Title>
                        <div className="pricing-price">500₽ <span className="pricing-unit">/ 1 занятие</span></div>
                    </div>
                    <div className="pricing-card pricing-card-featured">
                        <div className="pricing-icon">♕</div>
                        <Title level={4} className="pricing-title">Индивидуальное обучение с Международным Мастером</Title>
                        <div className="pricing-price">2.000₽ <span className="pricing-unit">/ 1 час</span></div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default HomePage;