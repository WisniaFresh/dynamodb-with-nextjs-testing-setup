export const URLS = {
  home: '/',
  dummiesTest: `/dummies-test`,
  dummyTest: (id: string) => `/dummies-test/${id}`,
  API: {
    dummyById: ({ id }: { id?: string }) => `/api/dummies/${id || ''}`,
    dummies: ({ queryParams }: { queryParams?: string }) =>
      `/api/dummies${queryParams || ''}`,
  },
};
