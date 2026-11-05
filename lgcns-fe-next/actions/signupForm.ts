export type SignupStep = 1 | 2 | 3 | 4;

export type SignupErrors = {
  userId?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  interests?: string;
  profileImageUrl?: string;
  form?: string;
};

export type SignupIntent = "next" | "back" | "skip";

export type SignupFormState = {
  step: SignupStep;
  userId: string;
  password: string;
  passwordConfirm: string;
  email: string;
  errors: SignupErrors;
  seq: number;
};

export const initialSignupState: SignupFormState = {
  step: 1,
  userId: "",
  password: "",
  passwordConfirm: "",
  email: "",
  errors: {},
  seq: 0,
};
