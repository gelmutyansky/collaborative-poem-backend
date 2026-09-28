import * as games from '../../handlers/games/handler.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 * */
export default async function(fastify) {
    fastify.post(
        '/start',
        {
            schema: {
                body:     {
                    type:       'object',
                    properties: {
                        gameName: {
                            type:      'string',
                            minLength: 1,
                        },
                    },
                    required:   [ 'gameName' ],
                },
                response: {
                    default: {
                        type:       'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { statusCode, ...data } = await games.startGame(request);
            return reply
                .status(statusCode)
                .send(data);
        },
    );

    fastify.post(
        '/end',
        {
            schema: {
                response: {
                    default: {
                        type:       'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { statusCode, ...data } = await games.endGame();
            return reply
                .status(statusCode)
                .send(data);
        },
    );

    fastify.get(
        '/status',
        {
            schema: {
                response: {
                    200:     {
                        type:       'object',
                        properties: {
                            message: {
                                type:       'object',
                                properties: {
                                    game:    {
                                        type:       'object',
                                        properties: {
                                            gameName:         { type: 'string' },
                                            isFinished:       { type: 'boolean' },
                                            poemLinePosition: { type: 'number' },
                                            hasPoems:         { type: 'boolean' },
                                        },
                                    },
                                    players: {
                                        type:  'array',
                                        items: {
                                            type:       'object',
                                            properties: {
                                                playerId:                { type: 'number' },
                                                playerName:              { type: 'string' },
                                                playerPoemLineSubmitted: { type: 'boolean' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    default: {
                        type:       'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { statusCode, ...data } = await games.getGameStatus(request);
            return reply
                .status(statusCode)
                .send(data);
        },
    );

    fastify.post(
        '/finish',
        {
            schema: {
                response: {
                    default: {
                        type:       'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { statusCode, ...data } = await games.finishGame();
            return reply
                .status(statusCode)
                .send(data);
        },
    );
}
