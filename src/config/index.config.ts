import * as facebookPassport from './facebook.passport.js';
import * as googlePassport from './google.passport.js';
import * as localPassport from './local.passport.js';

export const passportConfig={facebookPassport: facebookPassport, googlePassport: googlePassport, 
    localPassport: localPassport,isAuthenticated: localPassport.isAuthenticated,isAuthorized: localPassport.isAuthorized };