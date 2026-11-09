export interface SpringApiResponseType<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export type SpringLoginData = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
  role: string;
  platformRole: string;
  avatarUrl: string | null;
  presenceStatus: string;
  statusMessage: string | null;
  accountStatus: string;
  companyId: number | null;
};
