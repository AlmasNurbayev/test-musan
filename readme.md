Тестовое задание Musan

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