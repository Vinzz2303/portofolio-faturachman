import { hasProAccess } from './src/utils/entitlements.js';

const user = {
  fullname: "fatur",
  email: "faturachmanalkahfi7@gmail.com",
  plan: "free",
  isPro: false
};

console.log('isPro:', hasProAccess(user));
