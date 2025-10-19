export default {
  spec_dir: "src",
  spec_files: ["**/*[sS]pec.?(m)ts"],
  helpers:["/app/helpers/**/*.js"],
  env: {
    stopSpecOnExpectationFailure: false,
    random: false,
    forbidDuplicateNames: true,
  },
};
