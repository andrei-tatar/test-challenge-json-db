const fs = require('fs');
const util = require('util');

module.exports = {
    readStudentValue,
    putStudentValue,
    deleteStudentValue,
    
    readFileJson,
    writeFileJson,
};

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const mkdirAsync = util.promisify(fs.mkdir);
const existsAsync = util.promisify(fs.exists);
const directoryName = 'data';

async function deleteStudentValue(studentId, propertyPath) {
    const filePath = getFilePath(studentId);
    const data = await readFileJson(filePath);
    if (!data) { return false; }

    let update = data;
    for (let i = 0; i < propertyPath.length - 1; i++) {
        update = update[propertyPath[i]];
        if (update === void 0 || typeof update !== 'object') {
            return false;
        }
    }
    let lastPath = propertyPath[propertyPath.length - 1];
    if (update[lastPath] === void 0) { return false; }
    delete update[lastPath];

    await writeFileJson(filePath, data);
    return true;
}

async function putStudentValue(studentId, propertyPath, value) {
    await ensureDirectoryExists();
    const filePath = getFilePath(studentId);
    let data;

    if (propertyPath.length) {
        data = await readFileJson(filePath) || {};
        let update = data;
        for (let i = 0; i < propertyPath.length - 1; i++) {
            let next = update[propertyPath[i]];
            if (next === void 0 || typeof next !== 'object') {
                update[propertyPath[i]] = next = {};
            }
            update = next;
        }
        let lastPath = propertyPath[propertyPath.length - 1];
        update[lastPath] = value;
    } else {
        data = value;
    }

    await writeFileJson(filePath, data);
}

async function readStudentValue(studentId, propertyPath) {
    const filePath = getFilePath(studentId);
    let data = await readFileJson(filePath);

    for (const path of propertyPath) {
        if (data === void 0 || typeof data !== 'object') break;
        data = data[path];
    }

    return data;
}

async function readFileJson(filePath) {
    try {
        await ensureDirectoryExists();
        const buffer = await readFileAsync(filePath);
        const dataText = buffer.toString('utf8');
        const data = JSON.parse(dataText);
        return data;
    } catch (err) {
        if (err.code === 'ENOENT') {
            return undefined;
        }
        throw err;
    }
}

async function writeFileJson(filePath, data) {
    const serialized = JSON.stringify(data);
    await writeFileAsync(filePath, serialized);
}

async function ensureDirectoryExists() {
    if (!await existsAsync(directoryName)) {
        await mkdirAsync(directoryName);
    }
}

function getFilePath(studentId) {
    return `${directoryName}/${studentId}.json`;
}