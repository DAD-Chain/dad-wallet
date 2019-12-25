import { Signature, StateChannelApi } from 'dad-dapi';
// import { getRequestsManager } from '../requestsManager';


export const stateChannelApi: StateChannelApi = {
    login(): Promise<string> {
        // return getRequestsManager().initStateChannelLogin()
        throw new Error('UNSUPPORTED');
    },
    sign(): Promise<Signature> {
        throw new Error(('Not supported now'));
    }
}