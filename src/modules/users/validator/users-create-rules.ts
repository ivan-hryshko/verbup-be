// import { body, validationResult } from 'express-validator'

// export default class UsersCreateRules {
//   public static validateEmail() {
//     return body('email')
//       .trim()
//       .notEmpty().withMessage('Email is required.')
//       .isEmail().withMessage('Email must be a valid email address.')
//       .isLength({ min: 5, max: 100 }).withMessage('Email must be between 5 and 100 characters long.')
//   }
//   public static validateName() {
//     return body('name')
//       .trim()
//       .notEmpty().withMessage('Name is required.')
//       .isString().withMessage('Name must be a string.')
//       .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters long.')
//   }
//   public static validatePassword() {
//     return body('password')
//       .trim()
//       .notEmpty().withMessage('Password is required.')
//       .isString().withMessage('Password must be a string.')
//       .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters long.')
//   }
//   public static validateConfirmPassword() {
//     return body('confirmPassword')
//       .trim()
//       .notEmpty().withMessage('Confirm password is required.')
//       .isString().withMessage('Confirm password must be a string.')
//       .isLength({ min: 8, max: 100 }).withMessage('Confirm password must be between 8 and 100 characters long.')
//       .custom((value, { req }) => {
//         if (value !== req.body.password) {
//           throw new Error('Confirm password does not match password.')
//         }
//         return true
//       })
//   }
// }