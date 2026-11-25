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
    pgm.createTable('gamers', {
        gamerId:  'id',
        gameId:   {
            type:       'integer',
            references: 'games',
            comment:    'К какой игре относятся игрок',
        },
        playerId: {
            type:       'integer',
            references: 'players',
            comment:    'Что за игрок',
        },
    }, {
        ifNotExists: true,
        comment:     'Связь игроков с игрой',
    });

    pgm.dropColumns('players', 'gameId', {
        ifExists: true,
    });

    pgm.dropColumns('poems', 'playerIdCreator', {
        ifExists: true,
    });

    pgm.dropColumns('poem_lines', 'playerId', {
        ifExists: true,
    });

    pgm.addColumn('poems', {
        gamerIdCreator: {
            type:       'integer',
            references: 'gamers',
            comment:    'Игрок-создатель поэмы (первая строка за ним)',
        },
    }, {
        ifNotExists: true,
    });

    pgm.addColumn('poem_lines', {
        gamerId: {
            type:       'integer',
            references: 'gamers',
            comment:    'Автор строки',
        },
    }, {
        ifNotExists: true,
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropColumns('poem_lines', 'gamerId', {
        ifExists: true,
    });

    pgm.dropColumns('poems', 'gamerIdCreator', {
        ifExists: true,
    });

    pgm.addColumn('poem_lines', {
        playerId: {
            type:       'integer',
            references: 'players',
            comment:    'Автор строки',
        },
    }, {
        ifNotExists: true,
    });

    pgm.addColumn('poems', {
        playerIdCreator: {
            type:       'integer',
            references: 'players',
            comment:    'Игрок-создатель поэмы (первая строка за ним)',
        },
    }, {
        ifNotExists: true,
    });

    pgm.addColumn('players', {
        gameId: {
            type:       'integer',
            references: 'games',
            comment:    'К какой игре относятся игроки',
        },
    }, {
        ifNotExists: true,
    });

    pgm.dropTable('gamers', {
        ifExists: true,
    });
};
