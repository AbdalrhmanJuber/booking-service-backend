const { SpecReporter } = require("jasmine-spec-reporter");

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new SpecReporter({
  spec: {
    displayStacktrace: "raw",
    displayDuration: true,
    displayFailed: true,
    displayPending: true,
    displaySuccessful: true,
  }
}));
