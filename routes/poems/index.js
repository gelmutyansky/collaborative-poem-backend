import * as poems from '../../handlers/poems/handler.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 * */
export default async function(fastify) {
    fastify.post(
        '/continue',
        {
            schema: {
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
        async (request, reply) => {
            const { statusCode, ...data } = await poems.continuePoem();
            if (statusCode !== 200) {
                await reply.status(statusCode);
            }

            return reply.send(data);
        },
    );
}
