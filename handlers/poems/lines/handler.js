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
        statusCode: 400,
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
        statusCode: 400,
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
                                       AND poem_lines."poemLine" IS NULL`;
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

export {
    submitPoemLine,
    unsubmitPoemLine,
};
