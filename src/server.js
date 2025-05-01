import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyRedis from '@fastify/redis';
import { DateTime } from 'luxon';

import { sequelize } from './config/database.js'
import { Book, User } from './models/index.js';
import { UserService } from './services/user.service.js'

const fastify = Fastify({
    logger: true
})

fastify.register(fastifyJwt, {
    secret: 'supersecret',
    cookie: {
        cookieName: 'access_token',
        signed: false,
        expiresIn: '2d'
    }
})

fastify.addHook('onRequest', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    reply.header('Access-Control-Allow-Credentials', 'true');
  
    if (request.method === 'OPTIONS') {
      reply.code(204).send();
    }
  });

fastify.register(fastifyRedis, { host: '127.0.0.1', port: 6379, password: 'qazwsxedc' })

const userService = new UserService(fastify);

fastify.decorate("authenticate", async function (request, reply) {
    try {
        const user = await request.jwtVerify();

        const token = request.cookies.access_token
        const existingToken = await fastify.redis.get(`user:access_token:${user.id}`);

        if (token !== existingToken) {
            throw Error('Invalid token')
        }
    } catch (err) {
        reply.code(403).send({error: 'Unauthorized'})
    }
})

fastify.register(fastifyCookie, {
    secret: "supersecret",
    hook: 'onRequest',
    parseOptions: {}
})

fastify.post('/register', async function handler(request, reply) {
    const { error, data: result } = await userService.register(request.body);

    if (error) {
        return { error: 'Internal server error' };
    }

    return result;
})

fastify.post('/login', async function handler(request, reply) {
  const { error, data: user } = await userService.login(request.body);

  if (error) {
    return reply.status(401).send({ error });
  }

  const token = fastify.jwt.sign(user.dataValues, { expiresIn: '2d' });

  await fastify.redis.setex(`user:access_token:${user.dataValues.id}`, 60 * 60 * 48, token);
  reply.setCookie('access_token', token, {
    domain: 'localhost',
    path: '/',
    secure: true,
    sameSite: true,
    expires: DateTime.now().plus({ days: 2 }).toJSDate(),
  });

  return { token, user: { id: user.dataValues.id, email: user.dataValues.email } };
});


fastify.get('/me', {
    onRequest: [fastify.authenticate]
}, async function handler(request, reply) {
    const { error, data: user } = await userService.get(request.user.id);

    if (error) {
        return { error: 'Internal server error' };
    }

    const { password, salt, ...userData } = user.dataValues;
    return userData;
})

fastify.get('/logout', {
    onRequest: [fastify.authenticate]
}, async function handler(request, reply) {
    const { error, data } = await userService.logout(request.user.id);
    if (error) {
        return { error: 'Internal server error' };
    }
    reply.clearCookie('access_token');
    return { message: data };
});

fastify.get('/logout/active', {
    onRequest: [fastify.authenticate]
}, async function handler(request, reply) {
    const currentToken = request.cookies.access_token;
    const { error, data } = await userService.logoutActive(request.user.id, currentToken);
    if (error) {
        return { error: 'Internal server error' };
    }
    return { message: data };
});

fastify.get('/api/books', async function handler(request, reply) {
    const result = await Book.findAll();
    return result;
});

fastify.post('/api/books', async function handler(request, reply) {
    try {
        const { title, author, publishedYear } = request.body;
        const newBook = await Book.create({ title, author, publishedYear });
        return newBook;
    } catch (err) {
        console.error(err);
        return { error: 'Internal server error' };
    }
});

fastify.put('/api/books/:bookId', async function handler(request, reply) {
    try {
        const { bookId } = request.params;
        const { title, author, publishedYear } = request.body;
        const book = await Book.findByPk(bookId);
        if (book) {
            book.title = title;
            book.author = author;
            book.publishedYear = publishedYear;
            await book.save();
            return book;
        }
        return { error: 'Book not found' };
    } catch (err) {
        console.error(err);
        return { error: 'Internal server error' };
    }
});

fastify.patch('/api/books/:bookId', async function handler(request, reply) {
    try {
        const { bookId } = request.params;
        const book = await Book.findByPk(bookId);
        if (book) {
            for (const [key, value] of Object.entries(request.body)) {
                book[key] = value;
            }
            await book.save();
            return book;
        }
        return { error: 'Book not found' };
    } catch (err) {
        console.error(err);
        return { error: 'Internal server error' };
    }
});

fastify.delete('/api/books/:bookId', async function handler(request, reply) {
    try {
        const { bookId } = request.params;
        const book = await Book.findByPk(bookId);
        if (book) {
            await book.destroy();
            return { message: 'Book deleted' };
        }
        return { error: 'Book not found' };
    } catch (err) {
        console.error(err);
        return { error: 'Internal server error' };
    }
});

try {
    await sequelize.authenticate();
    await sequelize.sync()
    await fastify.listen({ port: 8000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}
