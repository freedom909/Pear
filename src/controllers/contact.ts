import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import nodemailerSendgrid from "nodemailer-sendgrid";
import { Recaptcha } from "express-recaptcha";

// Initialize SendGrid transporter
const transportConfig = nodemailerSendgrid({
  apiKey: process.env.SENDGRID_API_KEY as string,
});
const transporter = nodemailer.createTransport(transportConfig);

/**
 * Contact form page.
 * @route GET /contact
 */
export const getContact = (req: Request, res: Response): void => {
  res.render("contact", {
    title: "Contact",
    sitekey: process.env.RECAPTCHA_SITE,
    unknownUser: req.body.unknownUser
  });
};

/**
 * Send a contact form.
 * @route POST /contact
 */
export const postContact = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    await check("name", "Name is required").notEmpty().run(req);
    await check("email", "Email is required").notEmpty().run(req);
    await check("email", "Email is not valid").isEmail().run(req);
    await check("message", "Message is required").notEmpty().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      res.redirect("/contact");
      return;
    }

    // ReCaptcha validation
    const recaptchaResponse = req.body["g-recaptcha-response"];
    if (!recaptchaResponse) {
      req.flash("error", "Please complete the reCAPTCHA");
      res.redirect("/contact");
      return;
    }

    // Send email
    const mailOptions = {
      from: process.env.SENDGRID_FROM_EMAIL || "no-reply@example.com",
      to: process.env.CONTACT_EMAIL || req.body.email,
      subject: `Contact Form: ${req.body.subject || 'New Contact Message'}`,
      text: `
Name: ${req.body.name}
Email: ${req.body.email}

Message:
${req.body.message}
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    req.flash("success", "Your message has been sent successfully.");
    res.redirect("/contact");
  } catch (err) {
    console.error("Contact form error:", err);
    req.flash("error", "An error occurred while sending your message. Please try again later.");
    res.redirect("/contact");
  }
};