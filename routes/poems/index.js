import * as poems from '../../handlers/poems/handler.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 * */
export default async function(fastify) {
    fastify.post(
        '/continue',
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
            const { statusCode, ...data } = await poems.continuePoem();
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );

    fastify.post(
        '/readable/player',
        {
            schema: {
                body:     {
                    type:       'object',
                    properties: {
                        playerId:   { type: 'number' },
                        isReadable: { type: 'boolean' },
                    },
                    required:   [
                        'playerId',
                        'isReadable',
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
            const { statusCode, ...data } = await poems.markReadablePoemByPlayer(request);
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );

    fastify.post(
        '/readable/all',
        {
            schema: {
                body:     {
                    type:       'object',
                    properties: {
                        isReadable: { type: 'boolean' },
                    },
                    required:   [
                        'isReadable',
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
            const { statusCode, ...data } = await poems.markReadablePoemAllPlayers(request);
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );

}
