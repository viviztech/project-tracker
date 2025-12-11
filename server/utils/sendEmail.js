const sendEmail = async (options) => {
    // In a real application, you would use a service like Nodemailer, SendGrid, etc.
    // For this project, we will simulate sending an email by logging to the console.

    console.log("----------------------------------------------------");
    console.log(`EMAIL SENT TO: ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`MESSAGE:`);
    console.log(options.text);
    console.log("----------------------------------------------------");

    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 100);
    });
};

module.exports = sendEmail;
