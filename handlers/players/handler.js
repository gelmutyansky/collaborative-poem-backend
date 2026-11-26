import * as db from '../../db/index.js';
import { errorHandler } from '../../helpers/functions.js';

/**
 * Создание игрока
 * @param { Object } body
 * @param { string } body.playerName
 * @returns { Promise<{ message: string | { playerId: number }, statusCode: number }>}
 * */
async function createPlayer({ body }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };

    const funcName = createPlayer.name;

    try {
        const {
            playerName,
        } = body;

        const queryInsertPlayer = `INSERT INTO players ("playerName")
                                   VALUES ($1)
                                   RETURNING "playerId"`;
        const paramsInsertPlayer = [ playerName ];
        const resInsertPlayer = await db.query(queryInsertPlayer, paramsInsertPlayer);

        if (resInsertPlayer.rowCount !== 1) {
            console.error(`${ funcName }: Не получилось добавить игрока (paramsInsertPlayer: ${ JSON.stringify(paramsInsertPlayer) }, resInsertPlayer.rowCount: ${ resInsertPlayer.rowCount })`);
            return data;
        }

        const { playerId } = resInsertPlayer.rows[0];

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

/**
 * Получение списка игроков
 * @returns { Promise<{ message: string | { playerId: number, playerName: string }[], statusCode: number }>}
 * */
async function getPlayers() {
    let data = {
        message:    'error',
        statusCode: 500,
    };
    const funcName = getPlayers.name;

    try {
        const queryPlayers = `SELECT players."playerId"   AS "playerId",
                                     players."playerName" AS "playerName"
                              FROM players
                              ORDER BY "playerName"`;
        const resPlayers = await db.query(queryPlayers);

        data = {
            message:    resPlayers.rows,
            statusCode: 200,
        };
    }
    catch (e) {
        data = errorHandler(e, funcName);
    }

    return data;
}

export {
    createPlayer,
    getPlayers,
};
