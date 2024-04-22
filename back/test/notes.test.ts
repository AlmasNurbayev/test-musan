// !!! to import any module in test - to package.json add "type": "module",
import assert from 'assert';
import { after, before, describe, it } from 'node:test';
import { app } from '../index';
import supertest from 'supertest';
import { config } from '../config';
import TestAgent from 'supertest/lib/agent';
import http from 'http';

describe('Notes', async () => {
  let requestWithSupertest: TestAgent;
  let serverHTTP: http.Server;

  let accessToken = '';
  let cookie = '';
  let testUserId = 0;
  let newNoteId = 0;
  const testUserLogin = {
    login: config.testUser.email,
    password: config.testUser.password,
    type: 'email',
  };
  const newNote = {
    title: 'test_title',
    data: 'test_data',
    published: false,
    user_id: testUserId,
  };
  before(async () => {
    serverHTTP = app.listen();
    requestWithSupertest = supertest(serverHTTP);
    const response = await requestWithSupertest
      .post('/auth/login')
      .send(testUserLogin)
      .expect(200);
    cookie = response.headers['set-cookie'];
    accessToken = await response.body.data.accessToken;
    testUserId = response.body.data.user.id;
    console.log('testUserId', testUserId);
  });
  after(async () => {
    await requestWithSupertest.get('/auth/logout').set('Cookie', cookie).expect(200);
    console.log('server closing...');
    serverHTTP.close();
    process.exit(0);
  });

  it('fail - GET /notes without auth', async () => {
    await requestWithSupertest.get('/notes').expect(401);
  });

  it('sucess - GET /notes with auth', async () => {
    await requestWithSupertest
      .get('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        assert.ok(Array.isArray(res.body.data));
      });
  });

  it('fail - GET /notes with auth and very big take', async () => {
    await requestWithSupertest
      .get('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie)
      .query({ take: 999 })
      .expect(400);
  });

  it('sucess - POST /notes with auth', async () => {
    await requestWithSupertest
      .post('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie)
      .send(newNote)
      .expect(201)
      .expect((res) => {
        assert.ok(res.body.data.hasOwnProperty('id'));
        newNoteId = res.body.data.id;
      });
  });
});

//console.log('accessToken', accessToken);
