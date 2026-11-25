import * as players from '../../handlers/players/handler.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 * */
export default async function(fastify) {
    // fastify.post(
    //     '/create',
    //     {
    //         schema: {
    //             body:     {
    //                 type:       'object',
    //                 properties: {
    //                     playerName: {
    //                         type:      'string',
    //                         minLength: 1,
    //                     },
    //                 },
    //                 required:   [ 'playerName' ],
    //             },
    //             response: {
    //                 200:     {
    //                     type:       'object',
    //                     properties: {
    //                         message: {
    //                             type:       'object',
    //                             properties: {
    //                                 playerId: { type: 'number' },
    //                             },
    //                         },
    //                     },
    //                 },
    //                 default: {
    //                     type:       'object',
    //                     properties: {
    //                         message: { type: 'string' },
    //                     },
    //                 },
    //             },
    //         },
    //     },
    //     async (request, reply) => {
    //         const { statusCode, ...data } = await players.createPlayer(request);
    //
    //         if (statusCode === 200) {
    //             reply.setCookie('playerId', `${ data.message.playerId }`, {
    //                 maxAge: 172800,
    //             });
    //         }
    //
    //         return reply
    //             .status(statusCode)
    //             .send(data);
    //     },
    // );
    //
    // fastify.get(
    //     '/list',
    //     {
    //         schema: {
    //             response: {
    //                 200:     {
    //                     type:       'object',
    //                     properties: {
    //                         message: {
    //                             type:  'array',
    //                             items: {
    //                                 type:       'object',
    //                                 properties: {
    //                                     playerId:   { type: 'number' },
    //                                     playerName: { type: 'string' },
    //                                 },
    //                             },
    //                         },
    //                     },
    //                 },
    //                 default: {
    //                     type:       'object',
    //                     properties: {
    //                         message: { type: 'string' },
    //                     },
    //                 },
    //             },
    //         },
    //     },
    //     async (request, reply) => {
    //         const { statusCode, ...data } = await players.getPlayers();
    //         return reply
    //             .status(statusCode)
    //             .send(data);
    //     },
    // );
    //
    // fastify.get(
    //     '/remove',
    //     {
    //         schema: {
    //             response: {
    //                 default: {
    //                     type:       'object',
    //                     properties: {
    //                         message: { type: 'string' },
    //                     },
    //                 },
    //             },
    //         },
    //     },
    //     async (request, reply) => {
    //         const { statusCode, ...data } = await players.removePlayer(request);
    //
    //         if (statusCode === 200) {
    //             reply.clearCookie('playerId');
    //         }
    //
    //         return reply
    //             .status(statusCode)
    //             .send(data);
    //     },
    // );
}
