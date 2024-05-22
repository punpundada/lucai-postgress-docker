import * as user from './user';
import * as session from './session';
import * as services from './service';
import * as emailVerification from './email-varification';
import * as resetToken from './reset-token';

export default {
    ...user,
    ...session,
    ...services,
    ...emailVerification,
    ...resetToken
}