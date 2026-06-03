export const verificationEmailTemplate = (
  name: string,
  otp: string
) => {
  return `
    <div>
      <h2>Hello ${name}</h2>

      <p>
        Thank you for registering.
      </p>

      <p>
        Your verification code is:
      </p>

      <h1>${otp}</h1>

      <p>
        This OTP expires in 10 minutes.
      </p>
    </div>
  `;
};