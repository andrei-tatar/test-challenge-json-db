const student = require('./student');
const middleware = require('./middleware');

module.exports = {
  getHealth,
  getStudent,
  putStudent,
  deleteStudent,
}

async function getHealth(req, res, next) {
  res.json({ success: true })
}

async function deleteStudent(req, res, next) {
  try {
    const path = getPropertyPath(req);
    const success = await student.deleteStudentValue(req.params.studentId, path);
    if (!success) {
      middleware.notFound(req, res);
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    next(err);
  }
}

async function putStudent(req, res, next) {
  try {
    const path = getPropertyPath(req);
    await student.putStudentValue(req.params.studentId, path, req.body);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

async function getStudent(req, res, next) {
  try {
    const path = getPropertyPath(req);
    const result = await student.readStudentValue(req.params.studentId, path);
    if (result === void 0) {
      middleware.notFound(req, res);
    } else {
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
}

function getPropertyPath(req) {
  const path = req.params[0];
  return path && path.split('/') || [];
}