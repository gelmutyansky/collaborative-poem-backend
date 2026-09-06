/**
 * Обработка ошибки
 * @param { Error } e
 * @param { string } funcName
 * @returns { { message: string, statusCode: number } }
 * */
export function errorHandler(e, funcName) {
    console.error(`${ funcName }: ERROR`);
    console.error(e.message);
    console.error(e.stack);

    return {
        message:    'ERROR',
        statusCode: 500,
    };
}
