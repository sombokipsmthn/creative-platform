import { auth } from '@clerk/nextjs/server';

export const getCurrentUserId = async () => {
  const { userId } = await auth();
  return userId ?? null;
};
