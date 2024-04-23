// !!! to import any module in test - to package.json add "type": "module",
import { bootstrap } from '../bootstrap';
import supertest from 'supertest';
import { config } from '../config';
import TestAgent from 'supertest/lib/agent';
import http from 'http';
import { afterAll, assert, beforeAll, describe, it } from 'vitest';
import express from 'express';

function sum(a: number, b: number) {
  return a + b;
}

describe('Init', () => {
  it('success - sum', () => {
    assert.strictEqual(sum(1, 2), 3);
  });

  it('fail - sum', () => {
    assert.notStrictEqual(sum(1, 2), 4);
  });
});

describe('Auth', async () => {
  let requestWithSupertest: TestAgent;
  let app: express.Application;
  let server: http.Server;
  let accessToken = '';
  let cookie = '';
  const testUserLogin = {
    login: config.testUser.email,
    password: config.testUser.password,
    type: 'email',
  };

  beforeAll(async () => {
    app = bootstrap();
    server = app.listen();
    requestWithSupertest = supertest(server);

    const response = await requestWithSupertest
    .post('/auth/login')
    .send(testUserLogin)
    .expect(200);
    cookie = response.headers['set-cookie'];
    accessToken = await response.body.data.accessToken;
  });
  afterAll(async () => {
    console.log('server closing...');
    server.close();
    //process.exit(0);
  });

  it('success - GET / - Hello World', async () => {
    await requestWithSupertest
      .get('/')
      .expect(200)
      .expect(async (res) => {
        assert.strictEqual(res.text, 'Hello world');
      });
  });

  it('success - profile GET /auth/', async () => {
    await requestWithSupertest
      .get('/auth')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        assert.ok(res.body.data.hasOwnProperty('id'));
      });
  });
});
