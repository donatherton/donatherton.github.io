// Don't want to use ES6 imports as older browsers don't support it. So encapsulate appid using iife method
function appidStore() {
  const appid = "7f8871108ffeac097a03c40598d0232f";
  return () => {
    return appid;
  };
};
const getAppid = appidStore()
