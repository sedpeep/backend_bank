const { EncryptionKey } = require("../../config");
const fs = require("fs");

function capitalizeString(string) {
  if (string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  } else return string;
}

function isEmail(email) {
  var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (email !== "" && email.match(emailFormat)) {
    return true;
  }
  return false;
}
function format(template, ...params) {
  if (params.length === 0) {
    return template;
  }

  return template.replace(/%s/g, () => {
    const nextParam = params.shift();
    return nextParam !== undefined ? String(nextParam) : "%s";
  });
}

function SaveProfilePicture(base64Data, id) {
  let data = base64Data.replace(/^data:image\/png;base64,/, "");
  data = data.replace(/^data:image\/jpeg;base64,/, "");
  data = data.replace(/^data:image\/jpg;base64,/, "");

  const buffer = Buffer.from(data, "base64");

  let name = id + "_" + Date.now();

  fs.writeFileSync(`./src/data/ProfilePicture/${name}.png`, buffer);
  return name;
}

function GenerateRandomNum(num) {
  let randomNumber = "";
  for (let i = 0; i < num; i++) {
    randomNumber += Math.floor(Math.random() * 10);
  }
  return randomNumber;
}

function CreateConditions(x, data) {
  return Object.keys(data[x])
    .map((op) => {
      let e = data[x][op];
      if (typeof e === "string") e = `'${e}'`;
      switch (op) {
        case "$gt":
          return `${x} > ${e}`;
        case "$lt":
          return `${x} < ${e}`;
        case "$gte":
          return `${x} >= ${e}`;
        case "$lte":
          return `${x} <= ${e}`;
        default:
          return "";
      }
    })
    .filter((condition) => condition !== "");
}

function CreateAnd(data) {
  return Object.keys(data)
    .map((x) => {
      if (x === "$and") return ` ( ${CreateAnd(data[x])} ) `;
      if (x === "$or") return ` ( ${CreateOr(data[x])} ) `;
      if (typeof data[x] === "object")
        return `( ${CreateConditions(x, data).join(" AND ")} )`;
      return `${x} = ${typeof data[x] === "string" ? `'${data[x]}'` : data[x]}`;
    })
    .join(" AND ");
}

function CreateOr(data) {
  return Object.keys(data)
    .map((x) => {
      if (x === "$and") return ` ( ${CreateAnd(data[x])} ) `;
      if (x === "$or") return ` ( ${CreateOr(data[x])} ) `;
      if (typeof data[x] === "object")
        return `( ${CreateConditions(x, data).join(" OR ")} )`;
      return `${x} = ${typeof data[x] === "string" ? `'${data[x]}'` : data[x]}`;
    })
    .join(" OR ");
}

function CreateInsert(tableName, data) {
  try {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data)
      .map((e) => (typeof e === "string" ? `'${e}'` : e))
      .join(", ");
    return `INSERT INTO ${tableName} (${columns}) VALUES (${values}); `;
  } catch (err) {
    throw err;
  }
}

function CreateSearch(tableName, data, fields = "*") {
  try {
    let where = "";
    if (data !== 1) {
      where += "WHERE " + CreateAnd(data);
    }

    if (fields !== "*") fields = fields.join(", ");

    return `Select ${fields} from ${tableName} ${where};`;
  } catch (err) {
    throw err;
  }
}
function CreateUpdate(tableName, set, data) {
  try {
    let where = "";
    if (data !== 1) {
      where += "WHERE " + CreateAnd(data);
    }

    const values = Object.keys(set)
      .map(
        (e) => `${e} = ${typeof set[e] === "string" ? `'${set[e]}'` : set[e]}`,
      )
      .join(", ");

    return `Update ${tableName} SET ${values} ${where};`;
  } catch (err) {
    throw err;
  }
}
function CreateDelete(tableName, data) {
  try {
    let where = "";
    if (data !== 1) {
      where += "WHERE " + CreateAnd(data);
    }

    return `DELETE FROM ${tableName} ${where};`;
  } catch (err) {
    throw err;
  }
}

function CreateExecute(procName, data) {
  try {
    let values = "";
    if (data)
      values = Object.keys(data)
        .map(
          (e) =>
            `@${e} = ${typeof data[e] === "string" ? `'${data[e]}'` : data[e]}`,
        )
        .join(", ");

    return `EXECUTE ${procName} ${values};`;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  capitalizeString,
  SaveProfilePicture,
  isEmail,
  format,
  GenerateRandomNum,
  CreateInsert,
  CreateSearch,
  CreateUpdate,
  CreateDelete,
  CreateExecute,
};
