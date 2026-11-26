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
                        gameName:  {
                            type:      'string',
                            minLength: 1,
                        },
                        playerIds: {
                            type:     'array',
                            items:    { type: 'number' },
                            minItems: 1,
                        },
                    },
                    required:   [
                        'gameName',
                        'playerIds',
                    ],
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
                                    game:   {
                                        type:       'object',
                                        properties: {
                                            gameName:         { type: 'string' },
                                            isFinished:       { type: 'boolean' },
                                            poemLinePosition: { type: 'number' },
                                            hasPoems:         { type: 'boolean' },
                                        },
                                    },
                                    gamers: {
                                        type:  'array',
                                        items: {
                                            type:       'object',
                                            properties: {
                                                gamerId:             { type: 'number' },
                                                playerName:          { type: 'string' },
                                                isPoemLineSubmitted: { type: 'boolean' },
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
