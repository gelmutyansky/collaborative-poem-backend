import * as db from '../../db/index.js';
import { errorHandler } from '../../helpers/functions.js';

import _ from 'underscore';

/**
 * Начало игры, первоначальное создание записей под поэмы
 * @returns { Promise<{ message: string, statusCode: number }>}
 * */
async function startPoem() {
    let data = {
        message:    'error',
        statusCode: 400,
    };

    const funcName = startPoem.name;
    const client = await db.getClient();
    let hasTransaction = false;

    try {
        await client.query('BEGIN');
        hasTransaction = true;

        const queryInsertPoems = `INSERT INTO poems ("playerIdCreator", "gameId")
                                  SELECT p."playerId", g."gameId"
                                  FROM players p
                                           INNER JOIN games g ON p."gameId" = g."gameId"
                                  WHERE g."isActive" IS TRUE
                                  RETURNING poems."poemId", poems."playerIdCreator"`;
        const resInsertPoems = await client.query(queryInsertPoems);

        if (resInsertPoems.rowCount <= 0 || resInsertPoems.rows.length <= 0) {
            console.error(`${ funcName } Не добавлены пустые поэмы`);
            return data;
        }

        /** @type {{ poemId: number, playerIdCreator: number, order: []? }[]} */
        const poems = resInsertPoems.rows;
        const players = poems.map(poem => poem.playerIdCreator);

        for (const [ poemIndex, poem ] of poems.entries()) {
            const {
                poemId,
                playerIdCreator,
            } = poem;

            const queryInsertFirstLine = `INSERT INTO poem_lines ("poemId", "playerId", position)
                                          VALUES ($1, $2, 1)`;
            const paramsInsertFirstLine = [ poemId, playerIdCreator ];
            const resInsertFirstLine = await client.query(queryInsertFirstLine);

            if (resInsertFirstLine.rowCount <= 0) {
                const paramsInsertFirstLineStr = JSON.stringify(paramsInsertFirstLine);
                console.error(`${ funcName }: Линия поэмы другого игрока не добавлена (paramsInsertFirstLine: ${ paramsInsertFirstLineStr })`);
                return data;
            }

            poem.order = [ playerIdCreator ];

            let otherPlayers = _.without(players, playerIdCreator);

            let position = 1;
            while (otherPlayers.length > 0) {
                position++;

                let availablePlayers = [ ...otherPlayers ];

                if (poemIndex > 0) {
                    for (const [ poemIndexOther, poemOther ] of poems.entries()) {
                        if (poemIndexOther === poemIndex) {
                            break;
                        }

                        const { order } = poemOther;
                        const playerId = order[position - 1];
                        availablePlayers = _.without(availablePlayers, playerId);
                    }
                }

                const playerIdRandom = _.sample(availablePlayers);

                const queryInsertLine = `INSERT INTO poem_lines ("poemId", "playerId", position)
                                         VALUES ($1, $2, $3)`;
                const paramsInsertLine = [ poemId, playerIdRandom, position ];
                const resInsertLine = await client.query(queryInsertLine, paramsInsertLine);

                if (resInsertLine.rowCount <= 0) {
                    const paramsInsertLineStr = JSON.stringify(paramsInsertLine);
                    console.error(`${ funcName }: Линия поэмы другого игрока не добавлена (paramsInsertLine: ${ paramsInsertLineStr })`);
                    return data;
                }

                poem.order.push(playerIdRandom);
                otherPlayers = _.without(otherPlayers, playerIdRandom);
            }
        }

        const queryUpdateGame = `UPDATE games
                                 SET "poemLinePosition" = 1,
                                     "updateDate"       = NOW()
                                 WHERE "isActive" IS TRUE`;
        const resUpdateGame = await client.query(queryUpdateGame);

        if (resUpdateGame.rowCount <= 0) {
            console.error(`${ funcName } Не получилось обновить позицию в игре`);
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
 * Переход на следующую строку поэмы
 * @returns { Promise<{ message: string, statusCode: number }>}
 * */
async function continuePoem() {
    let data = {
        message:    'error',
        statusCode: 400,
    };

    const funcName = continuePoem.name;

    try {
        const queryCheckGame = `SELECT g."poemLinePosition"                        AS "poemLinePosition",
                                       BOOL_AND(pl_current."poemLine" IS NOT NULL) AS "isReadyForNextPosition",
                                       MAX(pl.position)                            AS "positionMax"
                                FROM games g
                                         LEFT JOIN poems p ON g."gameId" = p."gameId"
                                         LEFT JOIN poem_lines pl_current
                                                   ON p."poemId" = pl_current."poemId" AND
                                                      pl_current.position = g."poemLinePosition"
                                         LEFT JOIN poem_lines pl ON p."poemId" = pl."poemId"
                                WHERE g."isActive" IS TRUE
                                GROUP BY g."gameId"`;
        const resCheckGame = await db.query(queryCheckGame);

        if (resCheckGame.rows.length <= 0) {
            console.error(`${ funcName }: Не получилось получить данные по игре`);
            return data;
        }

        const {
            poemLinePosition,
            isReadyForNextPosition,
            positionMax,
        } = resCheckGame.rows[0];

        // Первый запуск
        if (poemLinePosition === 0) {
            data = await startPoem();
            return data;
        }

        if (!isReadyForNextPosition) {
            data.message = 'not ready';
            return data;
        }

        const nextPosition = poemLinePosition + 1;
        if (nextPosition > positionMax) {
            data.message = 'end game';
            return data;
        }

        const queryUpdateLinePosition = `UPDATE games
                                         SET "poemLinePosition" = "poemLinePosition" + 1
                                         WHERE "isActive" IS TRUE`;
        const resUpdateLinePosition = await db.query(queryUpdateLinePosition);

        if (resUpdateLinePosition.rowCount <= 0) {
            console.error(`${ funcName }: Не удалось обновить текущую позицию строки в поэме в игре`);
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
    startPoem,
    continuePoem,
};
