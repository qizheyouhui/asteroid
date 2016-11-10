import * as multiStorage from "./multi-storage";

export function onLogin ({id, token}) {
    this.userId = id;
    this.loggedIn = true;

    let promise;
    if (this.storeToken) {
      promise = multiStorage.set(this.endpoint + "__login_token__", token);
    } else {
      promise = Promise.resolve();
    }
    return promise.then(this.emit.bind(this, "loggedIn", id))
        .then(() => id);
}

export function onLogout () {
    this.userId = null;
    this.loggedIn = false;

    let promise;
    if (this.storeToken) {
      promise = multiStorage.del(this.endpoint + "__login_token__");
    } else {
      promise = Promise.resolve();
    }
    return promise.then(this.emit.bind(this, "loggedOut"))
        .then(() => null);
}

export function resumeLogin (token) {
    let tokenPromise;
    if (token) {
      tokenPromise = Promise.resolve({resume: token});
    } else {
      let promise;
      if (this.storeToken) {
        promise = multiStorage.get(this.endpoint + "__login_token__");
      } else {
        promise = Promise.resolve();
      }
      tokenPromise = promise.then(resume => {
          if (!resume) {
              throw new Error("No login token");
          }
          return {resume};
      });
    }
    return tokenPromise.then(this.login.bind(this))
        .catch(onLogout.bind(this));
}
