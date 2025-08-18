import nodemailer from 'nodemailer';

// Create transporter (you can configure this for your email provider)
const createTransporter = () => {
    // For development, you can use Gmail or other providers
    // For production, consider using services like SendGrid, Mailgun, etc.
    
    if (process.env.NODE_ENV === 'production') {
        // Production email configuration
        return nodemailer.createTransporter({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } else {
        // Development: Use Ethereal Email for testing
        return nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.ETHEREAL_USER || 'test@ethereal.email',
                pass: process.env.ETHEREAL_PASS || 'test123'
            }
        });
    }
};

// Email templates
const emailTemplates = {
    reportSubmitted: (userName, reportTitle) => ({
        subject: 'Report Submitted Successfully - Cypress Community Hub',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Cypress Community Hub</h1>
                    <p style="margin: 10px 0 0 0;">Thank you for helping improve our community!</p>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333; margin-bottom: 20px;">Report Submitted Successfully</h2>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Hello ${userName},
                    </p>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Your report "<strong>${reportTitle}</strong>" has been successfully submitted and is now under review by our community team.
                    </p>
                    
                    <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">What happens next?</h3>
                        <ul style="color: #666; margin: 0; padding-left: 20px;">
                            <li>Your report will be reviewed within 24-48 hours</li>
                            <li>You'll receive updates on the status of your report</li>
                            <li>Our team will work to resolve the issue as quickly as possible</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        You can track the progress of your report by logging into your account at any time.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3002/dashboard/my-reports" 
                           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            View My Reports
                        </a>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6; font-size: 14px;">
                        Thank you for your contribution to making our community better!
                    </p>
                </div>
                
                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">© 2024 Cypress Community Hub. All rights reserved.</p>
                </div>
            </div>
        `
    }),
    
    statusUpdated: (userName, reportTitle, newStatus, adminNotes) => ({
        subject: `Report Status Updated - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Cypress Community Hub</h1>
                    <p style="margin: 10px 0 0 0;">Your report has been updated!</p>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333; margin-bottom: 20px;">Report Status Updated</h2>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Hello ${userName},
                    </p>
                    
                    <p style="color: #666; line-height: 1.6;">
                        The status of your report "<strong>${reportTitle}</strong>" has been updated to:
                    </p>
                    
                    <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="margin: 0 0 10px 0; color: #333; text-transform: capitalize;">${newStatus}</h3>
                        ${adminNotes ? `<p style="color: #666; margin: 10px 0 0 0;"><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3002/dashboard/my-reports" 
                           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Report Details
                        </a>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6; font-size: 14px;">
                        Thank you for your patience and for helping improve our community!
                    </p>
                </div>
                
                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">© 2024 Cypress Community Hub. All rights reserved.</p>
                </div>
            </div>
        `
    }),
    
    reportResolved: (userName, reportTitle) => ({
        subject: 'Report Resolved - Cypress Community Hub',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Cypress Community Hub</h1>
                    <p style="margin: 10px 0 0 0;">Great news! Your report has been resolved!</p>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333; margin-bottom: 20px;">Report Resolved</h2>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Hello ${userName},
                    </p>
                    
                    <p style="color: #666; line-height: 1.6;">
                        We're happy to inform you that your report "<strong>${reportTitle}</strong>" has been successfully resolved!
                    </p>
                    
                    <div style="background: white; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">✅ Issue Resolved</h3>
                        <p style="color: #666; margin: 0;">
                            Our community team has successfully addressed the issue you reported. 
                            Thank you for bringing this to our attention and helping make our community better!
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3002/dashboard/my-reports" 
                           style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            View My Reports
                        </a>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6; font-size: 14px;">
                        Keep up the great work in helping us maintain a wonderful community!
                    </p>
                </div>
                
                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">© 2024 Cypress Community Hub. All rights reserved.</p>
                </div>
            </div>
        `
    })
};

// Send email function
const sendEmail = async (to, template, data) => {
    try {
        const transporter = createTransporter();
        
        // Get email template
        const emailTemplate = emailTemplates[template](...data);
        
        // Send email
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Cypress Community Hub" <noreply@cypress-community.com>',
            to: to,
            subject: emailTemplate.subject,
            html: emailTemplate.html
        });
        
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Email notification functions
const emailNotifications = {
    // Send report submitted confirmation
    reportSubmitted: async (userEmail, userName, reportTitle) => {
        return await sendEmail(userEmail, 'reportSubmitted', [userName, reportTitle]);
    },
    
    // Send status update notification
    statusUpdated: async (userEmail, userName, reportTitle, newStatus, adminNotes) => {
        return await sendEmail(userEmail, 'statusUpdated', [userName, reportTitle, newStatus, adminNotes]);
    },
    
    // Send resolution notification
    reportResolved: async (userEmail, userName, reportTitle) => {
        return await sendEmail(userEmail, 'reportResolved', [userName, reportTitle]);
    }
};

export {
    sendEmail,
    emailNotifications
};
