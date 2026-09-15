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
    pgm.createTable('poems', {
        poemId:          'id',
        playerIdCreator: {
            type:       'integer',
            references: 'players',
            // referencesConstraintName
            comment: 'Игрок-создатель поэмы (первая строка за ним)',
        },
        gameId:          {
            type:       'integer',
            references: 'games',
            // referencesConstraintName
            comment: 'К какой игре относится поэма',
        },
        createDate:      {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            comment: 'Дата создания записи',
        },
        updateDate:      {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            comment: 'Дата обновления записи',
        },
        isReadable:      {
            type:    'boolean',
            default: false,
            comment: 'Доступна ли поэма для чтения',
        },
        pdfFontSize:     {
            type:    'integer',
            default: 0,
            comment: 'Размер шрифта строк поэмы в PDF-файле',
        },
    }, {
        ifNotExists: true,
        comment:     'Поэмы',
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('poems', {
        ifExists: true,
    });
};
