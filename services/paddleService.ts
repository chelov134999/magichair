type PaddleInstance = {
  Environment: { set: (env: string) => void };
  Initialize: (config: { token: string }) => void;
  Checkout: {
    open: (config: {
      items: { priceId: string; quantity?: number }[];
      customer?: { email?: string };
      customData?: Record<string, unknown>;
      settings?: Record<string, unknown>;
    }) => void;
  };
};

declare global {
  interface Window {
    Paddle?: PaddleInstance;
  }
}

const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
const paddleEnv = import.meta.env.VITE_PADDLE_ENV || 'sandbox';

let initialized = false;

const getPaddle = (): PaddleInstance => {
  const paddle = window.Paddle;
  if (!paddle) {
    throw new Error('Paddle SDK not loaded. Ensure the script tag is present in index.html.');
  }
  return paddle;
};

const initPaddle = () => {
  if (initialized) return;
  if (!clientToken) {
    throw new Error('Missing VITE_PADDLE_CLIENT_TOKEN');
  }
  const paddle = getPaddle();
  try {
    paddle.Environment.set(paddleEnv);
  } catch {
    // Some environments may not require explicit env set; ignore.
  }
  paddle.Initialize({ token: clientToken });
  initialized = true;
};

export const openCheckout = async (priceId: string, userId: string, userEmail?: string) => {
  if (!userId) {
    throw new Error('User ID is required to open checkout.');
  }
  initPaddle();
  const paddle = getPaddle();
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: userEmail ? { email: userEmail } : undefined,
    customData: { user_id: userId },
    settings: {
      displayMode: 'overlay',
    },
  });
};
