console.log("Checking Environment Variables...");
console.log("RAZORPAY_KEY_ID exists:", !!process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_KEY_SECRET exists:", !!process.env.RAZORPAY_KEY_SECRET);
console.log("NEXT_PUBLIC_RAZORPAY_KEY_ID exists:", !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
console.log("NEXT_PUBLIC_PAYMENT_PROVIDER:", process.env.NEXT_PUBLIC_PAYMENT_PROVIDER);
console.log("Test done.");
