/**
 * Настройки
 * @type token: string - Токен бота
 * @type path: string - относительный путь до директории с сертификатами
 * @type key: string - приватный ключ
 * @type cert: string - сертификат сервера
 * @type ca: string - сертификат клиента
 * @type port: number - порт
 * @type domain: string - домен
 * @type whpath: string - путь
 * @type admin: number - id владельца бота
 */
const config = {
  "token": process.env.BOT_TOKEN,
  "admin": process.env.ADMIN,
  "onlyPhoto": process.env.ONLY_PHOTO === 'true'
};

module.exports = config;
