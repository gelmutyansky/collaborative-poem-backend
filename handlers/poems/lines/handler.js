import * as db from '../../../db/index.js';
import { errorHandler } from '../../../helpers/functions.js';

/**
 * Отправка линии поэмы
 * @param { Object } body
 * @param { string } body.poemLine
 * @param { string } body.fontName
 * @param { Object } cookies
 * @param { string } cookies.playerId
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
            playerId,
        } = cookies;

        const queryUpdatePoemLine = `UPDATE poem_lines
                                     SET "poemLine"   = $2,
                                         "fontName"   = $3,
                                         "updateDate" = NOW()
                                     FROM games
                                     WHERE poem_lines."playerId" = $1
                                       AND poem_lines.position = games."poemLinePosition"
                                       AND poem_lines."poemLine" IS NULL`;
        const paramsUpdatePoemLine = [ playerId, poemLine, fontName ];
        const resUpdatePoemLine = await db.query(queryUpdatePoemLine, paramsUpdatePoemLine);

        if (resUpdatePoemLine.rowCount <= 0) {
            const paramsUpdatePoemLineStr = JSON.stringify(paramsUpdatePoemLine);
            console.error(`${ funcName }: Не получилось обновить строку в поэме (paramsUpdatePoemLine: ${ paramsUpdatePoemLineStr })`);
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
 * @param { string } cookies.playerId
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
            playerId,
        } = cookies;

        const queryUpdatePoemLine = `UPDATE poem_lines
                                     SET "poemLine"   = NULL,
                                         "fontName"   = NULL,
                                         "updateDate" = NOW()
                                     FROM games
                                     WHERE poem_lines."playerId" = $1
                                       AND poem_lines.position = games."poemLinePosition"
                                       AND poem_lines."poemLine" IS NULL
                                       AND games."isFinished" IS FALSE`;
        const paramsUpdatePoemLine = [ playerId ];
        const resUpdatePoemLine = await db.query(queryUpdatePoemLine, paramsUpdatePoemLine);

        if (resUpdatePoemLine.rowCount <= 0) {
            const paramsUpdatePoemLineStr = JSON.stringify(paramsUpdatePoemLine);
            console.error(`${ funcName }: Не получилось обновить строку в поэме (paramsUpdatePoemLine: ${ paramsUpdatePoemLineStr })`);
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
 * @param { string } cookies.playerId
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
            playerId,
        } = cookies;

        const queryPreviousLine = `SELECT pl_prev."poemLine" AS "poemLine",
                                          pl_prev."fontName" AS "fontName"
                                   FROM games g
                                            INNER JOIN poems p ON g."gameId" = p."poemId"
                                            INNER JOIN poem_lines pl
                                                       ON p."poemId" = pl."poemId" AND pl.position = g."poemLinePosition"
                                            INNER JOIN poem_lines pl_prev ON pl."poemId" = pl_prev."poemId" AND
                                                                             pl.position = g."poemLinePosition" - 1
                                   WHERE g."isActive" IS TRUE
                                     AND pl."playerId" = $1`;
        const resPreviousLine = await db.query(queryPreviousLine, [ playerId ]);

        if (resPreviousLine.rows.length <= 0) {
            console.error(`${ funcName }: Предыдущая строка не найдена (playerId: ${ playerId })`);
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
 * @param { string } cookies.playerId
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
            playerId,
        } = cookies;

        const queryLines = `SELECT po_l."poemLine" AS "poemLine",
                                   po_l."position" AS "position",
                                   po_l."fontName" AS "fontName",
                                   pl."playerName" AS "playerName"
                            FROM games g
                                     INNER JOIN poems po ON g."gameId" = po."poemId"
                                     INNER JOIN poem_lines po_l on po."poemId" = po_l."poemId"
                                     INNER JOIN players pl ON po_l."playerId" = pl."playerId"
                            WHERE g."isActive" IS TRUE
                              AND po."isReadable" IS TRUE
                              AND po."playerIdCreator" = $1
                            ORDER BY po_l.position`;
        const resLines = await db.query(queryLines, [ playerId ]);

        if (resLines.rows.length <= 0) {
            console.error(`${ funcName } Не получены строки поэмы (playerId: ${ playerId })`);
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
