export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn()
});

export const usePathname = () => new String();

export const useSearchParams = jest.fn();

export const permanentRedirect = jest.fn();
