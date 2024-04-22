// !!! to import any module in test - to package.json add "type": "module",
import assert from 'assert';
import { after, before, describe, it } from 'node:test';
import { app } from '../index';
import supertest from 'supertest';
import { config } from '../config';
import TestAgent from 'supertest/lib/agent';
import http from 'http';

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
  let serverHTTP: http.Server;
  const testUserLogin = {
    login: config.testUser.email,
    password: config.testUser.password,
    type: 'email',
  };

  before(async () => {
    serverHTTP = app.listen();
    requestWithSupertest = supertest(serverHTTP);
  });
  after(async () => {
    //console.log('accessToken', accessToken);
    console.log('server closing...');
    serverHTTP.close();
    process.exit(0);
  });

  it('sucess - GET / - Hello World', async () => {
    await requestWithSupertest
      .get('/')
      .expect(200)
      .expect(async (res) => {
        assert.strictEqual(res.text, 'Hello world');
      });
  });

  it('sucess - POST /auth/login', async () => {
    await requestWithSupertest
      .post('/auth/login')
      .send(testUserLogin)
      .expect(200)
      .expect((res) => {
        assert.ok(res.body.data.hasOwnProperty('accessToken'));
      });
  });
});
