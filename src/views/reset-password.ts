type resetPassword = {
  redirectURL: string;
};
export const resetPasswordView = ({redirectURL}: resetPassword) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
            }
            .container p {
                margin-bottom: 15px;
            }
            .container ol {
                margin-bottom: 15px;
                padding-left: 20px;
            }
            .container ol li {
                margin-bottom: 5px;
            }
            .container a {
                color: #007bff;
                text-decoration: none;
                font-weight: bold;
                background-color: #007bff;
                padding: 8px 12px;
                border-radius: 4px;
                transition: background-color 0.3s;
                display: inline-block;
            }
            .container a:hover {
                background-color: #0056b3;
                color: #ffffff;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <p>Hello,</p>
            <p>We've received a request to reset your password. To proceed with the password reset, please follow the instructions below:</p>
            <ol>
                <li>Click on the following link to reset your password: <a href=${redirectURL}>Reset Password</a></li>
                <li>If you didn't request this password reset, please ignore this email. Your account is secure and no changes have been made.</li>
                <li>For security reasons, this link will expire in 15 mins. If you haven't reset your password within this time frame, you'll need to submit another password reset request.</li>
            </ol>
            <p>Thank you,<br>
        </div>
    </body>
    </html>
    `;
};
