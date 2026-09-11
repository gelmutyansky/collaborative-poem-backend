import * as db from '../../db/index.js';
import { errorHandler } from '../../helpers/functions.js';

/**
 * Начало игры
 * @param { Object } body
 * @param { string } body.gameName
 * @returns { Promise<{ message: string, statusCode: number }>}
 * */
async function startGame({ body }) {
    let data = {
        message:    'error',
        statusCode: 400,
    };

    const funcName = startGame.name;

    try {
        const queryCheckExistingGame = `SELECT
                                        FROM games
                                        WHERE "isActive" IS TRUE`;
        const resCheckExistingGame = await db.query(queryCheckExistingGame);

        if (resCheckExistingGame.rows.length > 0) {
            data.message = 'game is active';
            return data;
        }

        const {
            gameName,
        } = body;

        const queryInsertGame = `INSERT INTO games ("gameName", "isActive")
                                 VALUES ($1, TRUE)`;
        const resInsertGame = await db.query(queryInsertGame, [ gameName ]);

        if (resInsertGame.rowCount <= 0) {
            console.error(`${ funcName }: Игра не добавлена (gameName: ${ gameName })`);
            return data;
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

/**
 * Завершение игры
 * @returns { Promise<{ message: string, statusCode: number }>}
 * */
async function endGame() {
    let data = {
        message:    'error',
        statusCode: 400,
    };

    const funcName = endGame.name;

    try {
        const queryUpdateGame = `UPDATE games
                                 SET "isActive"   = FALSE,
                                     "updateDate" = NOW()
                                 WHERE "isActive" IS TRUE`;
        const resUpdateGame = await db.query(queryUpdateGame);

        if (resUpdateGame.rowCount <= 0) {
            console.error(`${ funcName }: Не получилось закончить игру`);
            return data;
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

/**
 * Получение статуса игры
 * @param { Object } cookies
 * @param { string? } cookies.playerId
 * @returns { Promise<{ message: string | { game: { gameName: string, isFinished: boolean, poemLinePosition: number, hasPoems: boolean }, players: { playerId: number, playerName: string, playerPoemLineSubmitted: boolean }[] }, statusCode: number }>}
 * */
async function getGameStatus({ cookies }) {
    let data = {
        message:    'error',
        statusCode: 400,
    };

    const funcName = getGameStatus.name;

    try {
        const {
            playerId,
        } = cookies;

        const queryGame = `SELECT g."gameName"               AS "gameName",
                                  g."isFinished"             AS "isFinished",
                                  g."poemLinePosition"       AS "poemLinePosition",
                                  po."poemId" IS NOT NULL    AS "hasPoems",
                                  pl."playerId"              AS "playerId",
                                  pl."playerName"            AS "playerName",
                                  pol."poemLine" IS NOT NULL AS "playerPoemLineSubmitted"
                           FROM games g
                                    LEFT JOIN players pl ON g."gameId" = pl."gameId"
                                    LEFT JOIN poems po ON g."gameId" = po."gameId"
                               AND po."playerIdCreator" = pl."playerId" -- чтобы не дублировались
                                    LEFT JOIN poem_lines pol
                                              ON po."poemId" = pol."poemId" AND pl."playerId" = pol."playerId"
                           WHERE g."isActive" IS TRUE`;
        const resGame = await db.query(queryGame);

        if (resGame.rows.length <= 0) {
            data.message = 'game not active';
            return data;
        }

        const {
            gameName,
            isFinished,
            poemLinePosition,
            hasPoems,
        } = resGame.rows[0];

        let players = resGame.rows;
        if (playerId) {
            players = [ players.find(player => player.playerId === +playerId) ];
        }

        data = {
            message:    {
                game:    {
                    gameName,
                    isFinished,
                    poemLinePosition,
                    hasPoems,
                },
                players: players,
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
 * Окончание игры
 * @returns { Promise<{ message: string, statusCode: number }>}
 * */
async function finishGame() {
    let data = {
        message:    'error',
        statusCode: 400,
    };

    const funcName = finishGame.name;

    try {
        const queryCheckPoems = `SELECT BOOL_AND(pl."poemLine" IS NOT NULL) AS "arePoemsFinished"
                                 FROM poem_lines pl
                                          INNER JOIN poems p ON pl."poemId" = p."poemId"
                                          INNER JOIN games g ON p."gameId" = g."gameId"
                                 WHERE g."isActive" IS TRUE`;
        const resCheckPoems = await db.query(queryCheckPoems);

        if (resCheckPoems.rows.length <= 0) {
            console.error(`${ funcName }: Не получен статус поэм`);
            return data;
        }

        const { arePoemsFinished } = resCheckPoems.rows[0];

        if (!arePoemsFinished) {
            console.error(`${ funcName }: Поэмы не завершены`);
            data.message = 'poems not finished';
            return data;
        }

        const queryUpdateGame = `UPDATE games
                                 SET "isFinished" = TRUE,
                                     "updateDate" = NOW()
                                 WHERE "isActive" IS TRUE`;
        const resUpdateGame = await db.query(queryUpdateGame);

        if (resUpdateGame.rowCount <= 0) {
            console.error(`${ funcName }: Не получилось завершить игру`);
            return data;
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
    startGame,
    endGame,
    getGameStatus,
    finishGame,
};
