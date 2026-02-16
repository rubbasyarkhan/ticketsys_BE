import transporter from "../config/mail.js";

const sendTicketCreatedEmail = async (ticket) => {
  const mailOptions = {
    from: `"Support System" <${process.env.SUPPORT_EMAIL}>`,
    to: ticket.email,
    subject: `Ticket Created: ${ticket.subject} [${ticket.ticketId}]`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2c3e50;">Ticket Confirmation</h2>
        <p>Hello ${ticket.name},</p>
        <p>Your support ticket has been successfully created. Our team will get back to you shortly.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Status:</strong> ${ticket.status}</p>
        </div>
        <p>Thank you for your patience.</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #7f8c8d;">This is an automated message, please do not reply directly to this email.</p>
      </div>
    `,
  };

  const supportMailOptions = {
    from: `"Alert System" <${process.env.SUPPORT_EMAIL}>`,
    to: process.env.SUPPORT_EMAIL,
    subject: `New Ticket: ${ticket.ticketId} - ${ticket.priority.toUpperCase()}`,
    html: `
      <h2>New Support Ticket Alert</h2>
      <p><strong>ID:</strong> ${ticket.ticketId}</p>
      <p><strong>From:</strong> ${ticket.name} (${ticket.email})</p>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      <p><strong>Message:</strong> ${ticket.message}</p>
      <p><strong>Priority:</strong> ${ticket.priority}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  await transporter.sendMail(supportMailOptions);
};

const sendAgentReplyEmail = async (ticket, reply) => {
  const mailOptions = {
    from: `"Support System" <${process.env.SUPPORT_EMAIL}>`,
    to: ticket.email,
    subject: `Re: ${ticket.subject} [${ticket.ticketId}]`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2c3e50;">Team Update</h2>
        <p>Hello ${ticket.name},</p>
        <p>A support agent has replied to your ticket.</p>
        <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #3498db;">
          <p style="margin: 0;">${reply}</p>
        </div>
        <p>You can view the full conversation using your Ticket ID: <strong>${ticket.ticketId}</strong></p>
        <hr style="border: 0; border-top: 1px solid #eee;">
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendTicketClosedEmail = async (ticket) => {
  const mailOptions = {
    from: `"Support System" <${process.env.SUPPORT_EMAIL}>`,
    to: ticket.email,
    subject: `Ticket Resolved: ${ticket.ticketId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #27ae60;">Ticket Resolved</h2>
        <p>Hello ${ticket.name},</p>
        <p>Your ticket <strong>${ticket.ticketId}</strong> has been marked as resolved/closed.</p>
        <p>If you feel this was done in error, or if you have any further questions, please feel free to create a new ticket.</p>
        <p>Thank you for choosing our service!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export { sendTicketCreatedEmail, sendAgentReplyEmail, sendTicketClosedEmail };
