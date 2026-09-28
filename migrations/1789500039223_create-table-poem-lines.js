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
    pgm.createTable('poem_lines', {
        poemLineId: 'id',
        poemId:     {
            type:       'integer',
            references: 'poems',
            comment:    'К какой поэме относится строка',
        },
        playerId:   {
            type:       'integer',
            references: 'players',
            comment:    'Автор строки',
        },
        poemLine:   {
            type:    'text',
            comment: 'Строка',
        },
        position:   {
            type:    'integer',
            notNull: true,
            comment: 'Позиция в поэме (от 1)',
        },
        fontName:   {
            type:    'text',
            comment: 'Название шрифта',
        },
        createDate: {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            notNull: true,
            comment: 'Дата создания записи',
        },
        updateDate: {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            notNull: true,
            comment: 'Дата обновления записи',
        },
    }, {
        ifNotExists: true,
        comment:     'Строки поэм',
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('poem_lines', {
        ifExists: true,
    });
};
