import nodemailer, { TransportOptions, SendMailOptions } from "nodemailer";

/**
 * Send an email using Nodemailer
 */
export const sendEmail = async (options: SendMailOptions): Promise<void> => {
  // 1️⃣ Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // use true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as TransportOptions);

  // 2️⃣ Define email details
  const mailOptions: SendMailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    ...options, // subject, to, text, html come from the caller
  };

  // 3️⃣ Send the email
  await transporter.sendMail(mailOptions);
};
