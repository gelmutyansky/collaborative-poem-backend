import * as players from '../../handlers/players/handler.js';

export default async function(fastify) {
    fastify.post(
        '/create',
        {
            schema: {
                body:     {
                    type:       'object',
                    properties: {
                        playerName: {
                            type:      'string',
                            minLength: 1,
                        },
                    },
                    required:   [ 'playerName' ],
                },
                response: {
                    200: {
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
            const { statusCode, ...data } = await players.createPlayer(request);
            if (statusCode !== 200) {
                reply.status(statusCode);
                return reply.send(data);
            }

            reply.setCookie('playerId', `${ data.message.playerId }`);
            return reply.send(data);
        },
    );

    fastify.get(
        '/list',
        {
            schema: {
                response: {
                    200: {
                        type:       'object',
                        properties: {
                            message: {
                                type:  'array',
                                items: {
                                    type:       'object',
                                    properties: {
                                        playerId:   { type: 'number' },
                                        playerName: { type: 'string' },
                                    },
                                },
                            },
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
            const { statusCode, ...data } = await players.getPlayers();
            if (statusCode !== 200) {
                reply.status(statusCode);
            }

            return reply.send(data);
        },
    );

    fastify.get(
        '/remove',
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
            const { statusCode, ...data } = await players.removePlayer(request)
            if (statusCode !== 200) {
                reply.status(statusCode);
                return reply.send(data);
            }

            reply.clearCookie('playerId');
            return reply.send(data);
        }
    )
}
