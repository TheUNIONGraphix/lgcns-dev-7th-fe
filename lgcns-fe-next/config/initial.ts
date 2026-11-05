const withoutAuthUrlList = ["/login", "/signup"];

const authUrlList = ["/cart", "/order"];
const authPrefixList = ["/postwrite"];

function safeCallbackPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  const pathname = value.split("?")[0];
  if (withoutAuthUrlList.includes(pathname)) return "/";
  return value;
}

export { authPrefixList, authUrlList, safeCallbackPath, withoutAuthUrlList };
