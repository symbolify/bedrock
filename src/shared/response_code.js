module.exports = {
  REGISTER: {
    INVAL_NO_PASS: {
      code: "INVAL_NO_PASS",
      type: "string",
      data: "Invalid password."
    },
    INVAL_PASS: {
      code: "INVAL_PASS",
      type: "string",
      data: "Invalid password, contact Admin."
    },
    INVAL_DUP_EML: {
      code: "INVAL_DUP_EML",
      type: "string",
      data: "Registration failed, duplicate email."
    },
    INVAL_REQ: {
      code: "REGISTER_INVAL_REQ",
      type: "string",
      data: "Registration failed, invalid request."
    },
    VAL_SUCC: {
      code: "REGISTER_VAL_SUCC",
      type: "string",
      data: "Registration succeeded."
    }
  },
  AUTH: {
    INVAL_REQ: {
      code: "AUTH_INVAL_REQ",
      type: "string",
      data: "Invalid request."
    },
    INVAL_AUTH: {
      code: "INVAL_AUTH",
      type: "string",
      data: "Authentication failed."
    },
    INVAL_AUTH_ADMIN: {
      code: "INVAL_AUTH_ADMIN",
      type: "string",
      data: "Authentication failed, contact Admin."
    },
    VAL_SUCC: {
      code: "AUTH_VAL_SUCC",
      type: "string",
      data: ""
    }
  },
  VERIFY: {
    VAL_SUCC: {
      code: "VERIFY_VAL_SUCC",
      type: "string",
      data: "Authentication succeeded."
    }
  },
  PROFILE: {
    INFO: { code: "INFO", type: "object", data: {} },
    EML_EXIST: {
      code: "EML_EXIST",
      type: "string",
      data: "Requested Email already exist."
    },
    SVR_ERR: {
      code: "SVR_ERR",
      type: "string",
      data: "Internal server error."
    },
    UPD_PROFILE: {
      code: "UPD_PROFILE",
      type: "string",
      data: "Profile updated."
    }
  },
  PASSWORD: {
    UPD_PASS: {
      code: "UPD_PASS",
      type: "string",
      data: "Password updated."
    },
    WNG_PASS: {
      code: "WNG_PASS",
      type: "string",
      data: "Wrong password."
    }
  }
};
