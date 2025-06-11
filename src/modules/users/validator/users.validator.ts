// import { RequestValidatror } from '../../../utils/request.validatro'
// import { UsersRequestCreate } from '../users.request'
// import UsersCreateRules from './users-create-rules'

// export class UsersValidator {
//   public static createMiddleware = [
//     UsersCreateRules.validateEmail(),
//     UsersCreateRules.validateName(),
//     UsersCreateRules.validatePassword(),
//     UsersCreateRules.validateConfirmPassword(),
//     RequestValidatror.validateRequestMiddleware,
//   ]

//   public static create(req: any, res: any) {
//     return {
//       email: req.body.email,
//       name: req.body.name,
//       password: req.body.password,
//       confirmPassword: req.body.confirmPassword,
//     } as UsersRequestCreate
//   }
// }
