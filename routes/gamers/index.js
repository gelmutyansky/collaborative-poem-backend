import * as gamers from '../../handlers/gamers/handler.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 * */
export default async function(fastify) {
    fastify.post(
        '/connect',
        {
            schema: {
                body:     {
                    type:       'object',
                    properties: {
                        gamerId: { type: 'number' },
                    },
                    required:   [
                        'gamerId',
                    ],
                },
                response: {
                    200:     {
                        type:       'object',
                        properties: {
                            message: {
                                type:       'object',
                                properties: {
                                    playerId: { type: 'number' },
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
            const { statusCode, ...data } = gamers.connectGamer(request);

            if (statusCode === 200) {
                reply.setCookie('playerId', `${ data.message.playerId }`, {
                    maxAge: 172800,
                });
            }

            return reply
                .status(statusCode)
                .send(data);
        },
    );

    fastify.post(
        '/disconnect',
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
            return reply
                .clearCookie('playerId')
                .status(200)
                .send({
                    message: 'success',
                });
        },
    );
}
