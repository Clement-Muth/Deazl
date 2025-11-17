const promiseMock = async (time = 2000) => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve("");
    }, time);
  });

  return promise;
};

export default promiseMock;
