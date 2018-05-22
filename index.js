const Schema = require("mongoose").Schema;
const mongoose = require("mongoose");

const checkSchema = new Schema(
  {},
  {
    discriminatorKey: "type",
    _id: false
  }
);

const baseSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  checks: [checkSchema]
});

const buildReducerSchema = (n = 0) => {
  if (n > 100) {
    return buildRuleSchema();
  }
  let reducerSchema = new Schema(
    {
      reducer: {
        type: String,
        enum: ["and", "or", "nor"]
      },
      checks: [checkSchema]
    },
    { _id: false }
  );
  reducerSchema
    .path("checks")
    .discriminator("reducer", buildReducerSchema(n + 1));
  reducerSchema.path("checks").discriminator("rule", buildRuleSchema());
  return reducerSchema;
};

const buildRuleSchema = () => {
  let ruleSchema = new Schema(
    {
      color: String
    },
    { _id: false }
  );
  return ruleSchema;
};

baseSchema.path("checks").discriminator("reducer", buildReducerSchema());
baseSchema.path("checks").discriminator("rule", buildRuleSchema());

const Base = mongoose.model("Base", baseSchema);

Promise.resolve()
  .then(() => console.log("Creating base..."))
  .then(
    () =>
      new Base({
        name: "String",
        foo: "bar",
        checks: [
          {
            type: "reducer",
            reducer: "and",
            checks: [
              {
                type: "rule",
                color: "red"
              }
            ]
          }
        ]
      })
  )
  .then(res => console.log(JSON.stringify(res, null, 2)));
