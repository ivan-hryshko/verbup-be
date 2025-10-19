import nodemailer from 'nodemailer'
import ENVS from '../../config/envs'

export interface IMailService {
  sendVerificationEmail(email: string, username: string, token: string): Promise<void>
  //   sendPasswordResetEmail(email: string, token: string): Promise<void>
}

export class MailService implements IMailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: ENVS.BREVO_SMTP_USER,
        pass: ENVS.BREVO_SMTP_PASSWORD,
      },
    })
  }

  async sendVerificationEmail(email: string, username: string, token: string): Promise<void> {
    // Production link
    // const verificationLink = `https://verbup-fe.vercel.app/verify-email?token=${token}`
    // Development link
    const verificationLink = `http://localhost:5173/verify-email?token=${token}`

    await this.transporter.sendMail({
      from: '"VerbUP" <verbup@ukr.net>',
      to: email,
      subject: 'Please verify your email',
      html: `
        <h2>Welcome ${username}!</h2>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    })
  }

  // async sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // Production link
  //   const resetLink = `https://verbup-fe.vercel.app/reset-password?token=${token}`
  // Development link
  // const resetLink = `http://localhost:5173/reset-password?token=${token}`

  //   await this.transporter.sendMail({
  //     from: '"VerbUP" <verbup@ukr.net>',
  //     to: email,
  //     subject: 'Reset your password',
  //     html: `
  //         <h2>Password Reset</h2>
  //         <p>Click below to reset your password:</p>
  //         <a href="${resetLink}">${resetLink}</a>
  //       `,
  //   })
  // }
}
