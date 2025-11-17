const Sequencer = require("@jest/test-sequencer").default;
// import { Sequencer } from "@jest/test-sequencer";

class CustomSequencer extends Sequencer {
  sort(tests: any) {
    // Test structure information
    // https://github.com/facebook/jest/blob/6b8b1404a1d9254e7d5d90a8934087a9c9899dab/packages/jest-runner/src/types.ts#L17-L21
    const copyTests = Array.from(tests);
    return copyTests.sort((testA: any, testB: any) => (testA.path > testB.path ? 1 : -1));
  }
}

module.exports = CustomSequencer;
