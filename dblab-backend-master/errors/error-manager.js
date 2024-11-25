const errors = require("./index");
const { format } = require("../src/utils/utils");

module.exports = {
  getError(res, errorCodeName, ...params) {
    if (!errors[errorCodeName]) {
      errorCodeName = "UNKNOWN_ERROR";
    }
    let errData = errors[errorCodeName];
    if (params.length !== 0) {
      errData.message = format(errData.message, ...params);
    }

    res.status(errData.statusCode);
    // delete errData.statusCode;

    return res.json(errData);
  },
};
