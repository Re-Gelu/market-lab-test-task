<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Тестовое задание - Market Lab

Реализовать бот хранения  ссылок используя фреймворк NestJS  
  
Необходимо реализовать бота, в котором будет следующий функционал  
  
- Сохранение ссылки  
Бот принимает ссылку (проверка что url, валиден), внутреннее название, сохраняет в свою бд, возвращает уникальный код, по которому можно получить ссылку  
- Список сохраненных ссылок  
бот выводит список ссылок и их уникальных кодов (пагинация не требуется, но будет плюсом)  
- Удаление ссылки  
пользователь может удалить ранее созданную им ссылку из бота  
- Получение ссылки  
Бот принимает ранее созданный уникальный код, возвращает связанную с ним ссылку если она существует, если её нет, то возвращает ошибку, так же пользователь может передавать любым способом уникальный код ссылки любому другому пользователю, по которой он так же сможет получить сохранненую ссылку  
  
После выполнения, код должен быть выложен в публичный репозиторий GitHub, Gitlab, BitBucket.  
Можно использовать любой способ хранения данных.

## Мысли

Бот задеплоен в режиме webhook'ов - [@market_lab_test_task_bot](https://t.me/market_lab_test_task_bot)

Для хранения данных использовал `PostgreSQL` с `Prisma ORM`, для работы с тг `nestjs-telegraf`. Сделал пагинацию (лимит на страницу - 5 записей), добавил Docker, задеплоил

Очень хотелось добавить адекватный менеджмент текстов бота. Реализовал это через `nestjs-i18n`, но в данном случае это оказалось не лучшим решением. Был выбор сделать немного через костыли или не делать совсем. Выбрал второе, надеюсь не критично :D

## Настройка окружения

Если указан `PRODUCTION_DOMAIN` бот будет работать в режиме webhook'ов 

```
POSTGRES_DB = "market-lab-test-task"
POSTGRES_USER = "postgres" или "localhost" при локальной разработке
POSTGRES_PASSWORD = "postgres"

DB_HOST = "postgres"
DB_PORT = "5432"

DATABASE_URL = postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DB_HOST}:${DB_PORT}/${POSTGRES_DB}

TELEGRAM_BOT_TOKEN="123:..."

PORT = "8000"
PRODUCTION_DOMAIN = "google.com" 
```

## Запуск через Docker

Самый простой вариант запуска. Создаем .env файл по указаниям выше и запускаем команду. При помощи docker-compose создастся бд и бот, выполнятся миграции 

```bash

$ yarn run docker
```

## Установка зависимостей и генерация типов Prisma

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod

# production mode with database prod migration
$ yarn run start:migrate:prod
```


##

![image](https://github.com/user-attachments/assets/72662458-34d1-482e-b189-83c6ef4482d5)

##
