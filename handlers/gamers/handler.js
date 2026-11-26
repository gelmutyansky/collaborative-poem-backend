import * as db from '../../db/index.js';
import { errorHandler } from '../../helpers/functions.js';

/**
 * Подключение игрока к игре
 * @param { Object } body
 * @param { number } body.gamerId
 * @returns { Promise<{ message: string | { playerId: number }, statusCode: number }>}
 * */
async function connectGamer({ body }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };

    const funcName = connectGamer.name;

    try {
        const {
            gamerId,
        } = body;

        const queryPlayer = `SELECT gamers."playerId"
                             FROM gamers
                                      INNER JOIN games ON gamers."gameId" = games."gameId"
                             WHERE games."isActive" IS TRUE
                               AND gamers."gamerId" = $1`;
        const paramsPlayer = [ gamerId ];
        const resPlayer = await db.query(queryPlayer, paramsPlayer);

        if (resPlayer.rows.length !== 1) {
            console.error(`${ funcName } Не получилось найти игрока для присоединения к текущей игре (paramsPlayer: ${ JSON.stringify(paramsPlayer) })`);
            return data;
        }

        const { playerId } = resPlayer.rows[0].playerId;

        data = {
            message:    {
                playerId: playerId,
            },
            statusCode: 200,
        };
    }
    catch (e) {
        data = errorHandler(e, funcName);
    }

    return data;
}

export {
    connectGamer,
};
