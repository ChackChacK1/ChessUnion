INSERT INTO users(id, password, created_at, email, first_name, last_name, rating, username) VALUES (1,'$2a$10$p8dTu3vjvd1v.D7pcoj0p.qLWQk6infCM06xAnqrc/NrHfcn0qKHm',
                                                                                                now(), 'admin@mail.ru', 'Administrito', 'Zabanito', 1000.00, 'Admin');

INSERT INTO users_roles(user_id, role_id) VALUES (1, 2);