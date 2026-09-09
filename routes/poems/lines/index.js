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
            const { statusCode, ...data } = await poemLines.unsubmitPoemLine(request);
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );
}
