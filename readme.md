
#Тестовое задание Musan (а скоро и boilerplate для Express)

## Что проект делает
- аутентификация email или phone
- отправка конфирмов через SMTP или СМС-сервис SMSC.ru/kz
- сессии, JWT, refresh
- валидация входных данных через схемы ZOD и для /auth и для /notes
- CRUD для 1 объекта notes
- redis с 3 областями - конфирмы (0), сессии (1), кеширование notes (2)
- унифицированный формат ответа и для успешных статусов и для ошибок
- rateLimit для одного эндпойнта, helmet для всех
- Prometheus-клиент и кастомная метрика для гистрограммы (http_request_duration_milliseconds) для трейсинга всех запросов
- логи Winston в консоль с кастомной раскраской

## Состав контейнеров
- back - основной Express-контейнер. Официальный image node.js. Пока по умолчанию стартует в TSX в Watch-режиме.
- db - официальный image Postgres. Миграции Prisma сами стартуют при запуске контейнера back
- redis - официальный image Redis
- prometheus - официальный image. Внимание - только в этом контейнере выведен внешний Volume, наружи папки с контейнерами, обычно это /var/lib/docker/volumes
Во всех остальных контейнерах данных сохраняются в их внутренних volume внутри папки пода.

## Аутентификация через email или phone. 
Последовательность аутентификации:
### Отправка кода через email или phone через GET /auth/request_confirm, 
В Query params передается:
- login (почтовый адрес или phone (в формате "77010123456") как стринг)
- type (строка "phone" или "email").
Не даст отправлять чаще 1 раза в 60 секунд в один адрес.
### Проверка кода GET /auth/submit_confirm
В Query params передается:
- login (почтовый адрес или phone (в формате "77010123456") как стринг)
- type (строка "phone" или "email").
- code как number (12345). 
После этого подтверждение сохраняется в redis на 24 часа.
### Регистрация - POST /auth/register. 
В body передаются:
- email (что-то одно обязательно)
- phone (что-то одно обязательно) 
- password 
- name (опционально)
### Логин - POST /auth/login. 
В body передаются:
- login (почтовый адрес или phone (в формате "77010123456") как стринг)
- type (строка "phone" или "email")
- password
### Профиль - GET /auth. 
Возвращает информацию о текущем юзере из сессии. 
### Выход из сессии - GET /auth/logout без параметров. 
Наличие сессии не проверяется
### Refresh - GET /auth/refresh. 
На основании куки с refresh-токеном выдается новая пара accessToken и RefreshToken. При наличии сессий не особо наверное и нужно. 

Для развернутого VPS - если не хочется проходить конфирм и регистрацию, можно юзать для логина готовую учетку:
{
    "type": "email",
    "login": "ntldr@mail.ru",
    "password": "12345678"
}

## Защита роутов токеном
Включено для всех маршрутов /notes. 
Проверяется валидность токена, проверяется наличие сессии.
Сессия живает 24 часа.

Если нет сессии в памяти Redis, то даже валидный и непротухший токен отклоняется. Тогда нужен новый логин, создается сессия и даже можно использовать предыдущий токен, если его срок позволяет. Это надо еще подумать.

## Модуль Notes
### POST /notes/ - создание новой записи. Нужен body:
- title: string
- data: string
- published: boolean
Из сессии берется user_id. Возвращает полную запись.
### GET /notes/ - получение списка записей с возможностью пагинации и фильтра по title. 
Через Query params можно передать skip, take, searchTitle
### GET /nodes/:id - получение записи по id
### PUT /nodes/:id - обновление записи по id. 
В body надо передать что меняем (title, data, published). Возвращает полную запись.
### DELETE /nodes/:id - удаление. Возвращает полную запись.  

Кеш с записями notes живет 24 часа:
- POST, PUT параллельно с Postgres создается/обновляется кеш записи в Redis. 
- GET/:id - отдается в первую очередь из кеша, если нет - из базы. 
- DELETE/:id - запись удаляется из кеша.  
- GET списком - кеш не используется, отдается сразу из базы.

## TODO
- e2e-тесты на большую часть эндпойнтов. Попробовать Mocha вместо Jest
- подумать как с наименьшими трудозатратами прикрутить Сваггер. Может быть ZOD заменить на Class-validator как в Nest
- решить с противоречием времени жизни сессии и токена
- для примера прикрутить Nginx-прокси для статики и проброса на другой порт
- Github actions

# Тестовое задание (JS Back-end)

Спасибо, что согласились на выполнение тестового задания. Мы рады отобрать вас в шорт-лист кандидатов и хотели бы немного больше узнать о ваших способностях работать с реальными данными. Это задание предназначается для разработки в свободное время и не имеет временных ограничений.

### Стэк

Вы можете использовать любые технологии на ваш выбор, но для данной позиции мы рекомендуем использовать следующий стэк:

- JavaScript / TypeScript
- Node.js
- Express.js
- Sequelize / Prisma / Express Session / Redis

### Ключевые навыки по которым будем оценивать

- Понимание самой задачи
- Читаемость кода
- Работоспособность кода
- Использованные библиотеки/инструменты/подходы

### Техническое задание

Создайте небольшой сервис для работы с заметками с возможностью авторизации, создания/изменения/удаления заметок и лимитирования запросов.

Мини-сервер должен иметь следующие эндпойнты:

```bash
POST /auth - Авторизация пользователя (можно сессиии/куки/jwt)
GET /auth - Вывод ID (session id, или др. id) текущего пользователя (если авторизован), либо возвращает 401
GET /notes - Возвращает заметки пользователя
POST /notes - Создает заметку
PT /notes/id/:id - Изменение заметки
DELETE /notes/id/:id - Удаление заметки
```

1. Защитите все эндпойнты (кроме GET /auth) таким образом, чтобы анонимные пользователи не смогли вызвать их. Только авторизованные.
2. Поставьте лимит на создание заметок (3 заметки в минуту на пользователя)
3. Структура заметок должна быть следующая:

```bash
// Notes object
{
	"id": INT,
	"user_id": INT,
	"data": STRING
}
```

Любой ответ сервера должен (по возможности) иметь соответствующий код и следующий формат:

```bash
// Response format
{
	"error": BOOL,
	"message": STRING,
	"statusCode": INT,
	"data": OBJECT | NULL
}
```

### Как и куда отправлять

1. Вы можете загрузить проект в Github, Bitbucket, Gitlab и выдать доступ на почту [digital@musan.kz](mailto:digital@musan.kz) или сделать его публичным.
2. Вы можете загрузить проект в ZIP-архив и направить нам на почту [digital@musan.kz](mailto:digital@musan.kz) или в Telegram (ник: @yerlanm)

### Вопросы

Любые вопросы по техническому заданию можно направить на почту [digital@musan.kz](mailto:digital@musan.kz) или Telegram (ник: @yerlanm). Во избежание инцидентов, мы просим воздержаться от использования личных данных в исходном коде (напр. реальные имена, почтовые адреса, пароли и т.д.).