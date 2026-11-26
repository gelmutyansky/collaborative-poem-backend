import * as db from '../../db/index.js';
import { errorHandler } from '../../helpers/functions.js';

/**
 * Начало игры
 * @param { Object } body
 * @param { string } body.gameName
 * @param { number[] } body.playerIds
 * @returns { Promise<{ message: string, statusCode: number }>}
 * */
async function startGame({ body }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };

    const funcName = startGame.name;
    const client = await db.getClient();
    let hasTransaction = false;

    try {
        const queryCheckExistingGame = `SELECT
                                        FROM games
                                        WHERE "isActive" IS TRUE`;
        const resCheckExistingGame = await client.query(queryCheckExistingGame);

        if (resCheckExistingGame.rows.length > 0) {
            data = {
                message:    'game active',
                statusCode: 503,
            };
            return data;
        }

        const {
            gameName,
            playerIds,
        } = body;

        await client.query('BEGIN');
        hasTransaction = true;

        const queryInsertGame = `INSERT INTO games ("gameName", "isActive")
                                 VALUES ($1, TRUE)
                                 RETURNING "gameId"`;
        const resInsertGame = await client.query(queryInsertGame, [ gameName ]);

        if (resInsertGame.rowCount !== 1 || resInsertGame.rows.length !== 1) {
            console.error(`${ funcName }: Игра не добавлена (gameName: ${ gameName })`);
            return data;
        }

        const { gameId } = resInsertGame.rows[0];

        const queryInsertGamers = `INSERT INTO gamers ("gameId", "playerId")
                                   VALUES (${ playerIds
                                       .map((playerId, index) => `$1, $${ index + 2 }`)
                                       .join('), (') })`;
        const paramsInsertGamers = [ gameId, ...playerIds ];
        const resInsertGamers = await client.query(queryInsertGamers, paramsInsertGamers);

        if (resInsertGamers.rowCount !== playerIds.length) {
            console.error(`${ funcName }: Не добавлены игроки (paramsInsertGamers: ${ JSON.stringify(paramsInsertGamers) }, resInsertGamers.rowCount: ${ resInsertGamers.rowCount }, playerIds.length: ${ playerIds.length })`);
            return data;
        }

        await client.query('COMMIT');
        hasTransaction = false;

        data = {
            message:    'success',
            statusCode: 200,
        };
    }
    catch (e) {
        data = errorHandler(e, funcName);
    }
    finally {
        if (hasTransaction) {
            await client.query('ROLLBACK');
        }

        client.release();
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
        statusCode: 500,
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
 * @returns { Promise<{ message: string | { game: { gameName: string, isFinished: boolean, poemLinePosition: number, hasPoems: boolean }, gamers: { gamerId: number, playerId: number, playerName: string, isPoemLineSubmitted: boolean }[] }, statusCode: number }>}
 * */
async function getGameStatus({ cookies }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };

    const funcName = getGameStatus.name;

    try {
        const {
            playerId,
        } = cookies;

        const queryGame = `SELECT games."gameName"                  AS "gameName",
                                  games."isFinished"                AS "isFinished",
                                  games."poemLinePosition"          AS "poemLinePosition",
                                  poems."poemId" IS NOT NULL        AS "hasPoems",
                                  gamers."gamerId"                  AS "gamerId",
                                  players."playerId"                AS "playerId",
                                  players."playerName"              AS "playerName",
                                  poem_lines."poemLine" IS NOT NULL AS "isPoemLineSubmitted"
                           FROM games
                                    LEFT JOIN gamers ON games."gameId" = gamers."gameId"
                                    LEFT JOIN players ON gamers."playerId" = players."playerId"
                                    LEFT JOIN poems ON games."gameId" = poems."gameId"
                               AND poems."gamerIdCreator" = gamers."gamerId" -- чтобы не дублировались
                                    LEFT JOIN poem_lines
                                              ON poems."poemId" = poem_lines."poemId" AND
                                                 gamers."gamerId" = poem_lines."gamerId"
                           WHERE games."isActive" IS TRUE`;
        const resGame = await db.query(queryGame);

        if (resGame.rows.length <= 0) {
            data = {
                message:    'game not active',
                statusCode: 503,
            };
            return data;
        }

        const {
            gameName,
            isFinished,
            poemLinePosition,
            hasPoems,
        } = resGame.rows[0];

        let gamers = resGame.rows;
        if (playerId) {
            gamers = [ gamers.find(gamer => +gamer.playerId === +playerId) ];
        }

        data = {
            message:    {
                game:   {
                    gameName,
                    isFinished,
                    poemLinePosition,
                    hasPoems,
                },
                gamers: gamers,
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
        statusCode: 500,
    };

    const funcName = finishGame.name;

    try {
        const queryCheckPoems = `SELECT BOOL_AND(poem_lines."poemLine" IS NOT NULL) AS "arePoemsFinished"
                                 FROM poem_lines
                                          INNER JOIN poems ON poem_lines."poemId" = poems."poemId"
                                          INNER JOIN games ON poems."gameId" = games."gameId"
                                 WHERE games."isActive" IS TRUE`;
        const resCheckPoems = await db.query(queryCheckPoems);

        if (resCheckPoems.rows.length <= 0) {
            console.error(`${ funcName }: Не получен статус поэм`);
            return data;
        }

        const { arePoemsFinished } = resCheckPoems.rows[0];

        if (!arePoemsFinished) {
            console.error(`${ funcName }: Поэмы не завершены`);
            data = {
                message:    'poems not finished',
                statusCode: 503,
            };
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
