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
};
