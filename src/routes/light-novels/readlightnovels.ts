import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { ILightNovelInfo, LIGHT_NOVELS } from '@consumet/extensions';
import NovelModel from '../../schema/novel_schema';
const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const animedailynovels = new LIGHT_NOVELS.AnimeDailyNovels();
  const db = getFirestore();
  const novelCollection = db.collection('novels')

  fastify.get('/', (_, rp) => {
    rp.status(200).send({
      intro:
        "Welcome to the animedailynovels provider: check out the provider's website @ https://animedailynovels.net/",
      routes: ['/:query', '/info', '/read'],
      documentation: 'https://docs.consumet.org/#tag/animedailynovels',
    });
  });

  fastify.get('/search', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.query as { query: string , page: number});
    const searchText = query.query;
    const pageNumber = query.page;
    
    const res = await animedailynovels.search(searchText, pageNumber);

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
      // Find the novel with this novel ID that was passed in.
      let novelItem = await NovelModel.findOne({'id': id});
      // if the novelList is empty then we need to fetch it from the API.
      if(!novelItem){
        const res = await animedailynovels
          .fetchLightNovelInfo(id, chapterPage)
          .catch((err) => reply.status(404).send({ message: err }));

          reply.status(200).send(res);
          // I want when the total length of the chapters is greater than 300 then save it to the database to make it easier to retrieve.
        if((res.chapters?.length ?? 0 > 300) && (res.chapters?.length ?? 0 < 4000)){
          await new NovelModel(res).save();
        }
      
      }else{
        // If the item is in our buffer db then we can just return that instead.
        let currentNovel = novelItem;
        reply.status(200).send(currentNovel);

        // Check to see if the status of the novel is completed. 
        // If it is not then ensure that we fetch to update the database with the most updated info.
        if(currentNovel.status !== "Completed"){
          const res = await animedailynovels
          .fetchLightNovelInfo(id, chapterPage)
          .catch((err) => reply.status(404).send({ message: err }));
          await currentNovel.updateOne(res);
        }
      }

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
  fastify.get('/novel-list/:routename/page/:page', async (request: FastifyRequest, reply: FastifyReply) => {
    const params = (request.params as { routename: string, page:number });
    const routeName = params.routename
    const pageNumber = params.page ?? 1;

    try {
      const res = await animedailynovels
        .fetchNovelList(routeName,pageNumber)
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
