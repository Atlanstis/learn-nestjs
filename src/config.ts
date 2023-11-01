export default () => {
  const dbPort = 3306;

  return {
    db: {
      host: 'localhost',
      port: dbPort,
    },
  };
};
