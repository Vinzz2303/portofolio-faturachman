import { hasProAccess } from './src/utils/entitlements';

const user = {
  fullname: "fatur",
  email: "faturachmanalkahfi7@gmail.com",
  plan: "free",
  isPro: false
};

console.log('isPro:', hasProAccess(user));
