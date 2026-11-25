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
            return reply
                .status(statusCode)
                .send(data);
        },
    );

    fastify.post(
        '/readable/gamer',
        {
            schema: {
                body:     {
                    type:       'object',
                    properties: {
                        gamerId:   { type: 'number' },
                        isReadable: { type: 'boolean' },
                    },
                    required:   [
                        'gamerId',
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
            const { statusCode, ...data } = await poems.markReadablePoemByGamer(request);
            return reply
                .status(statusCode)
                .send(data);
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
            const { statusCode, ...data } = await poems.markReadablePoemAllGamers(request);
            return reply
                .status(statusCode)
                .send(data);
        },
    );

}
