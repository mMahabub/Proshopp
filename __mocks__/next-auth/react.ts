// Mock for next-auth/react
export const useSession = jest.fn(() => ({
  data: null,
  status: 'unauthenticated',
}))

export const SessionProvider = ({ children }: { children: React.ReactNode }) => children
