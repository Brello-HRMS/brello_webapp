export interface RazorpayHandlerArgs {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (args: RazorpayHandlerArgs) => void;
  modal?: { ondismiss?: () => void; escape?: boolean };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

export const openRazorpayCheckout = (options: RazorpayOptions): void => {
  if (!window.Razorpay) {
    throw new Error('Razorpay SDK is not loaded. Please refresh and try again.');
  }
  const rzp = new window.Razorpay(options);
  rzp.open();
};
