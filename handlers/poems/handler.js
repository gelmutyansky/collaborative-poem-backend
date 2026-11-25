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
        statusCode: 500,
    };

    const funcName = startPoem.name;
    const client = await db.getClient();
    let hasTransaction = false;

    try {
        await client.query('BEGIN');
        hasTransaction = true;

        const queryInsertPoems = `INSERT INTO poems ("gamerIdCreator", "gameId")
                                  SELECT gamers."gamerId", games."gameId"
                                  FROM gamers
                                           INNER JOIN games ON gamers."gameId" = games."gameId"
                                  WHERE games."isActive" IS TRUE
                                  RETURNING poems."poemId", poems."gamerIdCreator"`;
        const resInsertPoems = await client.query(queryInsertPoems);

        if (resInsertPoems.rowCount <= 0 || resInsertPoems.rows.length <= 0) {
            console.error(`${ funcName } Не добавлены пустые поэмы`);
            return data;
        }

        /** @type {{ poemId: number, gamerIdCreator: number, order: []? }[]} */
        const poems = resInsertPoems.rows;
        const gamers = poems.map(poem => poem.gamerIdCreator);

        for (const [ poemIndex, poem ] of poems.entries()) {
            const {
                poemId,
                gamerIdCreator,
            } = poem;

            const queryInsertFirstLine = `INSERT INTO poem_lines ("poemId", "gamerId", position)
                                          VALUES ($1, $2, 1)`;
            const paramsInsertFirstLine = [ poemId, gamerIdCreator ];
            const resInsertFirstLine = await client.query(queryInsertFirstLine);

            if (resInsertFirstLine.rowCount <= 0) {
                console.error(`${ funcName }: Линия поэмы другого игрока не добавлена (paramsInsertFirstLine: ${ JSON.stringify(paramsInsertFirstLine) })`);
                return data;
            }

            poem.order = [ gamerIdCreator ];

            let otherGamers = _.without(gamers, gamerIdCreator);

            let position = 1;
            while (otherGamers.length > 0) {
                position++;

                let availableGamers = [ ...otherGamers ];

                if (poemIndex > 0) {
                    for (const [ poemIndexOther, poemOther ] of poems.entries()) {
                        if (poemIndexOther === poemIndex) {
                            break;
                        }

                        const { order } = poemOther;
                        const gamerId = order[position - 1];
                        availableGamers = _.without(availableGamers, gamerId);
                    }
                }

                const gamerIdRandom = _.sample(availableGamers);

                const queryInsertLine = `INSERT INTO poem_lines ("poemId", "gamerId", position)
                                         VALUES ($1, $2, $3)`;
                const paramsInsertLine = [ poemId, gamerIdRandom, position ];
                const resInsertLine = await client.query(queryInsertLine, paramsInsertLine);

                if (resInsertLine.rowCount <= 0) {
                    console.error(`${ funcName }: Линия поэмы другого игрока не добавлена (paramsInsertLine: ${ JSON.stringify(paramsInsertLine) })`);
                    return data;
                }

                poem.order.push(gamerIdRandom);
                otherGamers = _.without(otherGamers, gamerIdRandom);
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
        statusCode: 500,
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

/**
 * Отметить поэму как доступную/недоступную для чтения
 * @param { Object } body
 * @param { number } body.gamerId
 * @param { boolean } body.isReadable
 * @returns { Promise<{ message: string, statusCode: number }> }
 * */
async function markReadablePoemByGamer({ body }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };

    const funcName = markReadablePoemByGamer.name;

    try {
        const {
            gamerId,
            isReadable,
        } = body;

        const queryUpdate = `UPDATE poems
                             SET "isReadable" = $2,
                                 "updateDate" = NOW()
                             FROM games g
                             WHERE g."isActive" IS TRUE
                               AND g."isFinished" IS TRUE
                               AND poems."gameId" = g."gameId"
                               AND poems."gamerIdCreator" = $1`;
        const paramsUpdate = [ gamerId, isReadable ];
        const resUpdate = await db.query(queryUpdate, paramsUpdate);

        if (resUpdate.rowCount <= 0) {
            console.error(`${ funcName }: Не получилось обновить поэму как доступную для чтения (paramsUpdate: ${ JSON.stringify(paramsUpdate) })`);
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
 * Отметить все поэмы как доступные/недоступные для чтения
 * @param { Object } body
 * @param { boolean } body.isReadable
 * @returns { Promise<{ message: string, statusCode: number }> }
 * */
async function markReadablePoemAllGamers({ body }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };

    const funcName = markReadablePoemAllGamers.name;

    try {
        const {
            isReadable,
        } = body;

        const queryUpdate = `UPDATE poems
                             SET "isReadable" = $1,
                                 "updateDate" = NOW()
                             FROM games g
                             WHERE g."isActive" IS TRUE
                               AND g."isFinished" IS TRUE
                               AND poems."gameId" = g."gameId"`;
        const resUpdate = await db.query(queryUpdate, [ isReadable ]);

        if (resUpdate.rowCount <= 0) {
            console.error(`${ funcName }: Не получилось обновить поэмы как доступные для чтения (isReadable: ${ isReadable })`);
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
    markReadablePoemByGamer,
    markReadablePoemAllGamers,
};
