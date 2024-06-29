import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { LIGHT_NOVELS } from '@consumet/extensions';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const animedailynovels = new LIGHT_NOVELS.AnimeDailyNovels();
  

  fastify.get('/', (_, rp) => {
    rp.status(200).send({
      intro:
        "Welcome to the animedailynovels provider: check out the provider's website @ https://animedailynovels.net/",
      routes: ['/:query', '/info', '/read'],
      documentation: 'https://docs.consumet.org/#tag/animedailynovels',
    });
  });

  fastify.get('/search', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;
    console.log(request.query);
    console.log(query);
    
    const res = await animedailynovels.search(query);

    reply.status(200).send(res);
  });

  fastify.get('/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const id = (request.query as { id: string }).id;
    const chapterPage = (request.query as { chapterPage: number }).chapterPage;

    if (typeof id === 'undefined') {
      return reply.status(400).send({
        message: 'id is required',
      });
    }

    try {
      const res = await animedailynovels
        .fetchLightNovelInfo(id, chapterPage)
        .catch((err) => reply.status(404).send({ message: err }));

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Please try again later.' });
    }
  });

  fastify.get('/read', async (request: FastifyRequest, reply: FastifyReply) => {
    const chapterId = (request.query as { chapterId: string }).chapterId;

    if (typeof chapterId === 'undefined') {
      return reply.status(400).send({
        message: 'chapterId is required',
      });
    }

    try {
      const res = await animedailynovels
        .fetchChapterContent(chapterId)
        .catch((err) => reply.status(404).send(err));
        return reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Please try again later.' });
    }
  });
  fastify.get('/novel-list/:routename', async (request: FastifyRequest, reply: FastifyReply) => {
    const routeName = (request.params as { routename: string }).routename;

    try {
      const res = await animedailynovels
        .fetchNovelList(routeName)
        .catch((err) => reply.status(404).send(err));
        return reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Please try later.' });
    }
  });
  fastify.get('/genres', async (request: FastifyRequest, reply: FastifyReply) => {
    const chapterId = (request.query as { chapterId: string }).chapterId;

    try {
      const res = await animedailynovels
        .fetchGenreList(chapterId)
        .catch((err) => reply.status(404).send(err));
        return reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Please try again later.' });
    }
  });
};

export default routes;
