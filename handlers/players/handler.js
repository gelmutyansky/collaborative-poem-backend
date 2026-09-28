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

        const queryInsertPlayer = `INSERT INTO players ("gameId", "playerName")
                                   SELECT games."gameId", $1
                                   FROM games
                                            LEFT JOIN poems ON games."gameId" = poems."gameId"
                                   WHERE games."isActive" IS TRUE
                                     AND poems."poemId" IS NULL
                                   RETURNING "playerId"`;
        const resInsertPlayer = await db.query(queryInsertPlayer, [ playerName ]);

        if (resInsertPlayer.rowCount !== 1) {
            console.error(`${ funcName }: Не получилось добавить игрока (playerName: ${ playerName }, resInsertPlayer.rowCount: ${ resInsertPlayer.rowCount })`);
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
 * Получение списка игроков для перезахода в активную игру
 * @returns { Promise<{ message: string | { playerId: number, playerName: string }[], statusCode: number }>}
 * */
async function getPlayers() {
    let data = {
        message: 'error',
        statusCode: 500,
    };
    const funcName = getPlayers.name;

    try {
        const queryPlayers = `SELECT players."playerId"   AS "playerId",
                                     players."playerName" AS "playerName"
                              FROM players
                                       INNER JOIN games ON players."gameId" = games."gameId"
                              WHERE games."isActive" IS TRUE`;
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

/**
 * Удаление игрока или выход из игры (зачем-то)
 * @param { object } cookies
 * @param { string? } cookies.playerId
 * @returns { Promise<{ message: string, statusCode: number }>}
 * */
async function removePlayer({ cookies }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };
    const funcName = removePlayer.name;

    try {
        const {
            playerId,
        } = cookies;

        if (!playerId) {
            console.error(`${ funcName }: Нет playerId в куки для удаления (playerId: ${ playerId }, cookies: ${ JSON.stringify(cookies) })`);
            return data;
        }

        const queryCheckGame = `SELECT poems."poemId" IS NULL AS "isPreparePhase",
                                       games."gameId"
                                FROM games
                                         LEFT JOIN poems ON games."gameId" = poems."gameId"
                                WHERE games."isActive" IS TRUE`;
        const resCheckGame = await db.query(queryCheckGame);

        if (resCheckGame.rows.length <= 0) {
            console.error(`${ funcName }: Не получилось получить информацию об игре`);
            return data;
        }

        const {
            isPreparePhase,
            gameId,
        } = resCheckGame.rows[0];

        if (isPreparePhase) {
            const queryDeletePlayer = `DELETE
                                       FROM players
                                       WHERE "playerId" = $1
                                         AND "gameId" = $2`;
            const paramsDeletePlayer = [ playerId, gameId ];
            const resDeletePlayer = await db.query(queryDeletePlayer, paramsDeletePlayer);

            if (resDeletePlayer.rowCount <= 0) {
                const paramsDeletePlayerStr = JSON.stringify(paramsDeletePlayer);
                console.error(`${ funcName }: Не получилось удалить игрока во время фазы подготовки (paramsDeletePlayer: ${ paramsDeletePlayerStr })`);
                return data;
            }
        }

        data = {
            message:    'success',
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
    removePlayer,
};
