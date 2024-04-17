import axios from 'axios';
import { Logger } from '../shared/logger';

export class SmscService {
  private config: { host: string; user: string; password: string };
  constructor() {
    this.config = {
      host: String(process.env.SMSC_HOST) + 'rest/send/',
      user: String(process.env.SMSC_USER),
      password: String(process.env.SMSC_PASS),
    };
  }

  async sendSms(phone: string, text: string) {
    try {
      const sms = await axios.post(this.config.host, {
        login: this.config.user,
        psw: this.config.password,
        phones: phone,
        mes: text,
      });
      if (!sms.data.error) {
        return { data: sms.data };
      } else {
        return { error: sms.data.error };
      }
    } catch (error) {
      Logger.error(error);
      return { error: error };
    }
  }
}
