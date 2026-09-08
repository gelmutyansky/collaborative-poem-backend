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
                    200: {
                        type:       'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    400: {
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
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );

    fastify.post(
        '/end',
        {
            schema: {
                response: {
                    200: {
                        type:       'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    400: {
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
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );
}
