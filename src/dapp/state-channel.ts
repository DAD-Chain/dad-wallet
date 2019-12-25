import { Signature } from 'dad-dapi';
import { StateChannelApi } from 'dad-dapi/lib/types/api/stateChannel';

export const stateChannelApi: StateChannelApi = {
  async login(): Promise<string> {
    throw new Error('UNSUPPORTED');
  },

  async sign({  }: { channelId: string; scriptHash: string; message: string }): Promise<Signature> {
    throw new Error('UNSUPPORTED');
  },
};
