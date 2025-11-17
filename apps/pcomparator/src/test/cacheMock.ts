export default jest.mock("react", () => {
  const originalModule = jest.requireActual("react");
  return {
    ...originalModule,
    cache: <T extends Function>(func: T) => func
  };
});
