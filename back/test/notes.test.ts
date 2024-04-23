// !!! to import any module in test - to package.json add "type": "module",
//import { after, before, describe, it } from 'node:test';
import supertest from 'supertest';
import { config } from '../config';
import TestAgent from 'supertest/lib/agent';
import http from 'http';
import { afterAll, assert, beforeAll, describe, it } from 'vitest';
import { bootstrap } from '../bootstrap';
import express from 'express';

describe('Notes', async () => {
  let app: express.Application;
  let requestWithSupertest: TestAgent;
  let server: http.Server;

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
  const updateNote = {
    title: 'update_title',
    data: 'update_data',
    published: true,
    user_id: testUserId,
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
    testUserId = response.body.data.user.id;

    newNote.user_id = testUserId;
    updateNote.user_id = testUserId;

    console.log('testUserId', testUserId);
  });
  afterAll(async () => {
    await requestWithSupertest.get('/auth/logout').set('Cookie', cookie).expect(200);
    console.log('server closing...');
    //server.close();
    //process.exit(0);
  });

  it('fail - GET /notes without auth', async () => {
    await requestWithSupertest.get('/notes').expect(401);
  });

  it('success - GET /notes with auth', async () => {
    await requestWithSupertest
      .get('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        assert.ok(Array.isArray(res.body.data.notes));
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

  it('success - POST /notes with auth', async () => {
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

  it('success - GET /notes by id', async () => {
    await requestWithSupertest
      .get('/notes/' + newNoteId)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie)
      .query({ id: newNoteId })
      .expect(200)
      .expect((res) => {
        assert.ok(res.body.data.hasOwnProperty('id'));
      });
  });

  it('fail - GET /notes by random id over 9 000 000', async () => {
    await requestWithSupertest
      .get('/notes/' + String(Math.random() * 900000 + 9000000))
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie)
      .query({ id: newNoteId })
      .expect(404);
  });

  it('success - update /notes by id', async () => {
    await requestWithSupertest
      .put('/notes/' + newNoteId)
      .send(updateNote)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        assert.strictEqual(res.body.data.title, updateNote.title);
        assert.strictEqual(res.body.data.data, updateNote.data);
      });
  });

  it('success - delete /notes by id', async () => {
    await requestWithSupertest
      .delete('/notes/' + newNoteId)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie)
      .expect(200);
  });
});

//console.log('accessToken', accessToken);
