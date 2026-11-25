import * as db from '../../../db/index.js';
import { errorHandler } from '../../../helpers/functions.js';

/**
 * Отправка линии поэмы
 * @param { Object } body
 * @param { string } body.poemLine
 * @param { string } body.fontName
 * @param { Object } cookies
 * @param { string } cookies.gamerId
 * @returns { Promise<{ message: string, statusCode: number }>}
 * */
async function submitPoemLine({ body, cookies }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };

    const funcName = submitPoemLine.name;

    try {
        const {
            poemLine,
            fontName,
        } = body;

        const {
            gamerId,
        } = cookies;

        const queryUpdatePoemLine = `UPDATE poem_lines
                                     SET "poemLine"   = $2,
                                         "fontName"   = $3,
                                         "updateDate" = NOW()
                                     FROM games
                                     WHERE poem_lines."gamerId" = $1
                                       AND poem_lines.position = games."poemLinePosition"
                                       AND poem_lines."poemLine" IS NULL`;
        const paramsUpdatePoemLine = [ gamerId, poemLine, fontName ];
        const resUpdatePoemLine = await db.query(queryUpdatePoemLine, paramsUpdatePoemLine);

        if (resUpdatePoemLine.rowCount <= 0) {
            console.error(`${ funcName }: Не получилось обновить строку в поэме (paramsUpdatePoemLine: ${ JSON.stringify(paramsUpdatePoemLine) })`);
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
 * Отмена линии поэмы
 * @param { Object } cookies
 * @param { string } cookies.gamerId
 * @returns { Promise<{ message: string, statusCode: number }>}
 * */
async function unsubmitPoemLine({ cookies }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };

    const funcName = unsubmitPoemLine.name;

    try {
        const {
            gamerId,
        } = cookies;

        const queryUpdatePoemLine = `UPDATE poem_lines
                                     SET "poemLine"   = NULL,
                                         "fontName"   = NULL,
                                         "updateDate" = NOW()
                                     FROM games
                                     WHERE poem_lines."gamerId" = $1
                                       AND poem_lines.position = games."poemLinePosition"
                                       AND poem_lines."poemLine" IS NULL
                                       AND games."isFinished" IS FALSE`;
        const paramsUpdatePoemLine = [ gamerId ];
        const resUpdatePoemLine = await db.query(queryUpdatePoemLine, paramsUpdatePoemLine);

        if (resUpdatePoemLine.rowCount <= 0) {
            console.error(`${ funcName }: Не получилось обновить строку в поэме (paramsUpdatePoemLine: ${ JSON.stringify(paramsUpdatePoemLine) })`);
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
 * Получение предыдущей строки поэмы
 * @param { Object } cookies
 * @param { string } cookies.gamerId
 * @returns { Promise<{ message: string | { poemLine: string, fontName: string }, statusCode: number }> }
 * */
async function getPreviousPoemLine({ cookies }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };

    const funcName = getPreviousPoemLine.name;

    try {
        const {
            gamerId,
        } = cookies;

        const queryPreviousLine = `SELECT poem_lines_previous."poemLine" AS "poemLine",
                                          poem_lines_previous."fontName" AS "fontName"
                                   FROM games g
                                            INNER JOIN poems ON g."gameId" = poems."poemId"
                                            INNER JOIN poem_lines poem_lines_current
                                                       ON poems."poemId" = poem_lines_current."poemId" AND
                                                          poem_lines_current.position = g."poemLinePosition"
                                            INNER JOIN poem_lines_current poem_lines_previous
                                                       ON poem_lines_current."poemId" = poem_lines_previous."poemId" AND
                                                          poem_lines_current.position = g."poemLinePosition" - 1
                                   WHERE g."isActive" IS TRUE
                                     AND poem_lines_current."gamerId" = $1`;
        const paramsPreviousLine = [ gamerId ];
        const resPreviousLine = await db.query(queryPreviousLine, paramsPreviousLine);

        if (resPreviousLine.rows.length <= 0) {
            console.error(`${ funcName }: Предыдущая строка не найдена (paramsPreviousLine: ${ JSON.stringify(paramsPreviousLine) })`);
            return data;
        }

        data = {
            message:    resPreviousLine.rows[0],
            statusCode: 200,
        };
    }
    catch (e) {
        data = errorHandler(e, funcName);
    }

    return data;
}

/**
 * Получение цельной поэмы
 * @param { Object } cookies
 * @param { string } cookies.gamerId
 * @returns { Promise<{ message: string | { poemLine: string, position: number, fontName: string, playerName: string }[], statusCode: number }>}
 * */
async function getAllPoemLines({ cookies }) {
    let data = {
        message:    'error',
        statusCode: 500,
    };

    const funcName = getAllPoemLines.name;

    try {
        const {
            playerId: gamerId,
        } = cookies;

        const queryLines = `SELECT poem_lines."poemLine" AS "poemLine",
                                   poem_lines."position" AS "position",
                                   poem_lines."fontName" AS "fontName",
                                   players."playerName"  AS "playerName"
                            FROM games
                                     INNER JOIN poems ON games."gameId" = poems."poemId"
                                     INNER JOIN poem_lines on poems."poemId" = poem_lines."poemId"
                                     INNER JOIN gamers ON poem_lines."gamerId" = gamers."gamerId"
                                     INNER JOIN players ON gamers."playerId" = players."playerId"
                            WHERE games."isActive" IS TRUE
                              AND poems."isReadable" IS TRUE
                              AND poems."gamerIdCreator" = $1
                            ORDER BY poem_lines.position`;
        const paramsLines = [ gamerId ];
        const resLines = await db.query(queryLines, paramsLines);

        if (resLines.rows.length <= 0) {
            console.error(`${ funcName } Не получены строки поэмы (paramsLines: ${ JSON.stringify(paramsLines) })`);
            return data;
        }

        data = {
            message:    resLines.rows,
            statusCode: 200,
        };
    }
    catch (e) {
        data = errorHandler(e, funcName);
    }

    return data;
}

export {
    submitPoemLine,
    unsubmitPoemLine,
    getPreviousPoemLine,
    getAllPoemLines,
};
