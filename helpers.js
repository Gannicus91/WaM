/**
 * Существует ли юзер с таким именем
 *
 * @param {String} name
 * @param {Object} data
 */
function userExists(name, data) {
  const users = data.filter(({ nameComponents }) => {
    const formatName = name.split(/\s+/gm).reduce((prev, el) => {
      if (!el) {
        return prev;
      }

      prev.push(el.toLowerCase());

      return prev;
    }, []);

    return formatName.every((el) => ~nameComponents.indexOf(el));
  });

  if (users.length === 1) {
    return users.pop();
  } if (users.length > 1) {
    throw new Error('Найдено несколько участников. Уточните запрос');
  } else {
    throw new Error('Участник не найден');
  }
}

/**
 *
 * @param {String} name
 * @param {Object} ctx
 * @return {Object}
 */
function getFriendDataByName(name, ctx) {
  try {
    return userExists(name, ctx.session.friends);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  userExists,
  getFriendDataByName,
};
