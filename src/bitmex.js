//@flow
import axios from 'axios';
import crypto from 'crypto';
import { getTime } from 'date-fns';

class Bitmex {
  static get balance(): number {
    const path = '/api/v1/user/wallet';
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

    return (async () => {
      try {
        const response = await axios.get(`https://bitmex.com${path}`, {
          headers,
        });

        if (response.status !== 200) {
          return 0;
        }

        const { data } = response;

        return data.amount / 100000000;
      } catch (e) {
        return 0;
      }
    })();
  }
}

export default Bitmex;
