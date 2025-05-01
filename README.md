# Лабораторная работа 6
## Авторизация, аутентификация и идентификация
### Цель работы
Реализовать аутентификацию пользователя (нескольких сессий) с возможностью выборочного завершения сессии

### Технические требования:
- Наличие интернет-соединения
- Наличие [Postman](https://www.postman.com/downloads/) или 
- Наличие [Node](https://nodejs.org/en) [v22 и выше] или наличие [NVM](https://github.com/nvm-sh/nvm) для переключения между версиями Node
- Наличие [Docker](https://docs.docker.com/desktop/)

### Ход работы:

1. В директории с лабораторной работой выполните запуск контейнеров при помощи команды `docker-compose up -d` (`docker compose up -d`)

2. В директории с лабораторной работой выполните установку зависимостей при комощи команды `npm i`

3. В директории с лабораторной работой выполните запуск проекта с помощью команды `npm start`

4. Выполните следующий запрос в Postman для создания нового пользователя

```
curl --location 'http://localhost:8000/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "user1@example.com",
    "password": "QWERTY"
}'
```

5. Убедитесь в существовании новой записи в таблице `users`, используя один из представленных вариантов:
- PgAdmin
![](https://storage.yandexcloud.net/shesterikov/WP/WP_6_1.png)

- Psql CLI
```
docker exec -it lab_6_db psql -U student lab_6_db
```

```
SELECT * from users;
```

```
 id |       email       | password |    salt    |         createdAt          |         updatedAt          
----+-------------------+----------+------------+----------------------------+----------------------------
  1 | user1@example.com | QWERTY   | thisIsSalt | 2025-04-15 12:36:27.572+00 | 2025-04-15 12:36:27.572+00
```

В примере выше поле `password` содержит в себе пароль пользователя в открытом виде. При этом соль остается неизменной. 

6. Выполните вход, используя следующий запрос

```
curl --location 'http://localhost:8000/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "user1@example.com",
    "password": "QWERTY"
}'
```

В результате работы данного запроса будет установлена Cookie `access_token`, а в Redis будет добавлен новый `access_token`
Для получения токена из Redis можно воспользоваться Redis CLI
```
docker exec -it redis-lab_6-container redis-cli -h 127.0.0.1 -p 6379 -a 'qazwsxedc'
```

```
GET user:access_token:1
```

В результате выполнения команды будет выведен `access_token` для данного пользователя

```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyMUBleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUVdFUlRZIiwic2FsdCI6InRoaXNJc1NhbHQiLCJjcmVhdGVkQXQiOiIyMDI1LTA0LTE1VDEyOjM2OjI3LjU3MloiLCJ1cGRhdGVkQXQiOiIyMDI1LTA0LTE1VDEyOjM2OjI3LjU3MloiLCJpYXQiOjE3NDQ3MjExNjQsImV4cCI6MTc0NDg5Mzk2NH0.lUtUhxpMDvt4OEW5ErQ5Np0b4i1qRNKAxvxUCZJR6BI"
```

В данном примере используется вариант с хранением одной пользовательской сессии.

7. Выполните следующий запрос для получения информации о пользователе

```
curl --location 'http://localhost:8000/me' \
--header 'Content-Type: application/json' \
--header 'Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyMUBleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUVdFUlRZIiwic2FsdCI6InRoaXNJc1NhbHQiLCJjcmVhdGVkQXQiOiIyMDI1LTA0LTE1VDEyOjM2OjI3LjU3MloiLCJ1cGRhdGVkQXQiOiIyMDI1LTA0LTE1VDEyOjM2OjI3LjU3MloiLCJpYXQiOjE3NDQ3MjExNjQsImV4cCI6MTc0NDg5Mzk2NH0.lUtUhxpMDvt4OEW5ErQ5Np0b4i1qRNKAxvxUCZJR6BI'
```

В результате выполнения будет получен JSON с основной информацией о пользователе

```
{
    "id": 1,
    "email": "user1@example.com",
    "password": "QWERTY",
    "salt": "thisIsSalt",
    "createdAt": "2025-04-15T12:36:27.572Z",
    "updatedAt": "2025-04-15T12:36:27.572Z"
}
```

8. Выполните удаление `access_token` из Redis, используя Redis CLI
```
DEL user:access_token:1
```

Результат успешного вызова команды
```
(integer) 1
```

9. Выполните запрос из шага 8 повторно
В результате возникнет ошибка, связанная с некорректным токеном

```
{
    "error": "Unauthorized"
}
```

10. Модифицируйте исходный код приложения в соответствии со следующими требованиями

- Требуется реализовать хранение пароля в виде хеша с использованием соли (отличающейся для каждого пользователя). 
Предполагается использование модуля [Crypto](https://nodejs.org/api/crypto.html)
- Требуется реализовать поддержку работы с хешированными паролями и солью при аутентификации пользователя.
- Требуется реализовать хранение нескольких пользовательских сессий с возможностью ограничения времени их действия (TTL). 
Предполагается использование встроенных функций в Redis, к примеру [Scan](https://redis.io/docs/latest/commands/scan/), [Expire](https://redis.io/docs/latest/commands/expire/) и [Set](https://redis.io/docs/latest/commands/set/)
- Требуется реализовать ендпоинт `GET /logout` для завершения текущей сессии.
- Требуется ⁠реализовать ендпоинт `GET /logout/active` для завершения всех сессий, кроме текущей.
- Требуется модифицировать возвращаемые данные с ендпоинта `GET /me` (не должны возвращаться password и salt)

### Документация:

[Redis](https://redis.io/docs/latest/commands/)

[@fastify/redis](https://www.npmjs.com/package/@fastify/redis)

### Контрольные вопросы:
1. Что такое Redis? Для чего используется Redis? Какие методы и CLI команды вы использовали при выполнении данной работы?
2. В чем разница между аутентификацией, авторизацией и идентификацией?
3. Что такое Cookie? В чем разница Cookie с флагом `secure` и без него?