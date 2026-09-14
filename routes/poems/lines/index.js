import * as poemLines from '../../../handlers/poems/lines/handler.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 * */
export default async function(fastify) {
    fastify.post(
        '/submit',
        {
            schema: {
                body:     {
                    type:       'object',
                    properties: {
                        poemLine: {
                            type:      'string',
                            minLength: 1,
                        },
                        fontName: {
                            type:      'string',
                            minLength: 1,
                        },
                    },
                    required:   [
                        'poemLine',
                        'fontName',
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
            const { statusCode, ...data } = await poemLines.submitPoemLine(request);
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );

    fastify.post(
        '/unsubmit',
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
            const { statusCode, ...data } = await poemLines.unsubmitPoemLine(request);
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );

    fastify.get(
        '/previous',
        {
            schema: {
                response: {
                    200:     {
                        type:       'object',
                        properties: {
                            message: {
                                type:       'object',
                                properties: {
                                    poemLine: { type: 'string' },
                                    fontName: { type: 'string' },
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
            const { statusCode, ...data } = await poemLines.getPreviousPoemLine(request);
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );

    fastify.get(
        '/all',
        {
            schema: {
                response: {
                    200:     {
                        type:       'object',
                        properties: {
                            message: {
                                type:  'array',
                                items: {
                                    type:       'object',
                                    properties: {
                                        poemLine:   { type: 'string' },
                                        position:   { type: 'number' },
                                        fontName:   { type: 'string' },
                                        playerName: { type: 'string' },
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
            const { statusCode, ...data } = await poemLines.getAllPoemLines(request);
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );
}
