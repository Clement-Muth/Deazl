export let consoleErrorSpy: jest.SpyInstance | undefined = undefined;

export let consoleWarnSpy: jest.SpyInstance | undefined = undefined;

export let consoleInfoSpy: jest.SpyInstance | undefined = undefined;

export let consoleDebugSpy: jest.SpyInstance | undefined = undefined;

export function spyConsoleOutput() {
  const originalConsoleError = global.console.error;
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation((...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("When testing, code that causes React state updates should be wrapped into act(...):")
    ) {
      return;
    }

    return originalConsoleError.apply(console, args);
  });

  consoleWarnSpy = jest.spyOn(console, "warn");

  consoleInfoSpy = jest.spyOn(console, "info");

  consoleDebugSpy = jest.spyOn(console, "debug");
}

export function restoreConsoleOutput() {
  consoleErrorSpy?.mockRestore();
  consoleWarnSpy?.mockRestore();
  consoleInfoSpy?.mockRestore();
  consoleDebugSpy?.mockRestore();
}
