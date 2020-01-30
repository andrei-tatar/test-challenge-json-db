const tape = require('tape')
const jsonist = require('jsonist')
const student = require('./student');

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'should have successful healthcheck')
    t.end()
  })
})

tape('put creates file', async function (t) {
  const { response } = await jsonist.put(`${endpoint}/1/a`, { b: 'it works' });
  t.equal(response.statusCode, 204, 'Status code is no content');

  const file = await student.readFileJson(`data/1.json`);
  t.deepEqual(file, { "a": { "b": "it works" } }, 'File created with correct object');

  t.end();
});

tape('get returns property', async function (t) {
  await student.writeFileJson(`data/2.json`, { a: { b: { c: "It works" } } });
  const { data } = await jsonist.get(`${endpoint}/2/a/b/c`);
  t.equal(data, 'It works', 'Property value as expected');
  t.end();
});

tape('get returns object', async function (t) {
  await student.writeFileJson(`data/3.json`, { a: { b: { c: "It works" } } });
  const { data } = await jsonist.get(`${endpoint}/2/a`);
  t.deepEquals(data, { b: { c: "It works" } }, 'Object value as expected');
  t.end();
});

tape('get throws 404', async function (t) {
  const { response } = await jsonist.get(`${endpoint}/invalid_id`);
  t.equal(response.statusCode, 404, 'Missing student id - status code not found');
  t.end();
});

tape('delete throws 404', async function (t) {
  await student.writeFileJson(`data/delete_test.json`, { a: { b: { c: "It works" } } });
  const { response: r1 } = await jsonist.delete(`${endpoint}/delete_test/b`);
  t.equal(r1.statusCode, 404, 'Missing property - Status code not found');

  const { response: r2 } = await jsonist.delete(`${endpoint}/13`);
  t.equal(r2.statusCode, 404, 'Missing student id - status code not found');

  t.end();
});

tape('delete works', async function (t) {
  const filename = `data/delete_test2.json`;
  await student.writeFileJson(filename, { a: { b: "It works" }, c: "Again" });
  const { response } = await jsonist.delete(`${endpoint}/delete_test2/a/b`);
  t.equal(response.statusCode, 204, 'Delete no content');

  const file = await student.readFileJson(filename);
  t.deepEqual(file, { a: {}, c: 'Again' });

  t.end();
});

tape('cleanup', function (t) {
  server.close()
  t.end()
})
