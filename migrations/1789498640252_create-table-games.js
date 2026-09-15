/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('games', {
        gameId:           'id',
        gameName:         {
            type:    'text',
            notNull: true,
            comment: 'Название игры',
        },
        isActive:         {
            type:    'boolean',
            default: false,
            comment: 'Активна ли игра',
        },
        createDate:       {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            comment: 'Дата создания записи',
        },
        updateDate:       {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            comment: 'Дата обновления записи',
        },
        poemLinePosition: {
            type:    'integer',
            default: 0,
            comment: 'На какой строке текущая игра (в начале 0, после создания поэм 1 и далее)',
        },
        isFinished:       {
            type:    'boolean',
            default: false,
            comment: 'Завершена ли игра. На этом этапе можно читать поэмы',
        },
    }, {
        ifNotExists: true,
        comment:     'Игры',
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('games', {
        ifExists: true,
    });
};
