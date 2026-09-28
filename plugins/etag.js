import fp from 'fastify-plugin';
import Etag from '@fastify/etag';

export default fp(async (fastify) => {
    fastify.register(Etag);
});
