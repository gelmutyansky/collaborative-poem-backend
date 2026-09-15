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
    pgm.createTable('players', {
        playerId:   'id',
        gameId:     {
            type:       'integer',
            references: 'games',
            // referencesConstraintName
            comment: 'К какой игре относятся игроки',
        },
        playerName: {
            type:    'text',
            comment: 'Имя игрока',
        },
        createDate: {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            comment: 'Дата создания записи',
        },
        updateDate: {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            comment: 'Дата обновления записи',
        },
    }, {
        ifNotExists: true,
        comment:     'Игроки',
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('players', {
        ifExists: true,
    });
};
