import { UserPayloadType } from "@/types/request/RequestType";

type LoginFieldName = keyof UserPayloadType;

export const emptyErrors: Record<LoginFieldName, string> = {
  userId: "",
  password: "",
};
