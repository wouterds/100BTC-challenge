//@flow
import axios from 'axios';
import crypto from 'crypto';
import { getTime } from 'date-fns';

const apiCall = async (path: string): ?Object => {
  path = `/api/v1${path}`;
  const expires = getTime(new Date());

  const signature = crypto
    .createHmac('sha256', process.env.BITMEX_API_KEY_SECRET)
    .update(`GET${path}${expires}`)
    .digest('hex');

  const headers = {
    'api-expires': expires,
    'api-key': process.env.BITMEX_API_KEY_ID,
    'api-signature': signature,
  };

  try {
    const response = await axios.get(`https://bitmex.com${path}`, {
      headers,
    });

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  } catch (e) {
    return null;
  }
};

class Bitmex {
  static get balance(): number {
    return (async () => {
      const data = await apiCall('/user/wallet');

      if (!data) {
        return 0;
      }

      return parseFloat(data.amount / 100000000);
    })();
  }
}

export default Bitmex;
