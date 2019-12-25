// import Address = Crypto.Address;
import { Balance, Block, MerkleProof, Network, NetworkApi, Transaction } from 'dad-dapi';
import { getBalance } from '../api/runtimeApi';
// import { Crypto } from 'ontology-ts-sdk';
// import { decodeAmount } from 'src/popup/utils/number';
// import { getTokenBalance } from '../api/tokenApi';
// import { getClient } from '../network';
// import { getStore } from '../redux';

export const networkApi: NetworkApi = {

    /**
     * Checks if connected to network.
     * Because of multiple delays in different parts of browser and api,
     * the information about disconnect is not instant.
     */
    isConnected(): Promise<boolean> {
        // const state = getStore().getState();
        // const status = state.status.networkState;

        // return Promise.resolve(status === 'CONNECTED');

        throw new Error('UNSUPPORTED');

    },

    /**
     * Gets the currently connected network.
     */
    getNetwork(): Promise<Network> {
        // const state = getStore().getState();
        // return Promise.resolve({
        //     address: state.settings.address,
        //     type: state.settings.net
        // });
        throw new Error('UNSUPPORTED');

    },

    async getBalance({ address }): Promise<Balance> {
        try {
            console.log('call get balance 0');
            let res = await getBalance(address);
            console.log('call get balance 1'+res);
            const balance : Balance = {
                ONT: "0",
                ONG: "0",
                DAD: res.result.dad,
            }
            return Promise.resolve(balance); 
        } catch (error) {
            console.log('call get balance 3'+error);
            return Promise.reject(error); 
        }

    },

    async getBlock({ block }): Promise<Block> {
        // const client = getClient();
        // const response = await client.getBlockJson(block);
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },

    async getTransaction({ txHash }): Promise<Transaction> {
        // const client = getClient();
        // const response = await client.getRawTransactionJson(txHash);
        // return response.Result;
        throw new Error('UNSUPPORTED');

    },

    async getNodeCount(): Promise<number> {
        // const client = getClient();
        // const response = await client.getNodeCount();
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },

    async getBlockHeight(): Promise<number> {
        // const client = getClient();
        // const response = await client.getBlockHeight();
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },

    async getMerkleProof({ txHash }): Promise<MerkleProof> {
        // const client = getClient();
        // const response = await client.getMerkleProof(txHash);
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },

    async getStorage({ contract, key }): Promise<string> {
        // const client = getClient();
        // const response = await client.getStorage(contract, key);
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },

    async getAllowance({ asset, fromAddress, toAddress }): Promise<number> {
        // const client = getClient();
        // const response = await client.getAllowance(asset, new Address(fromAddress), new Address(toAddress));
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },

    async getUnboundOng({ address }) {
        // const client = getClient();
        // const response = await client.getUnboundong(new Address(address));
        // return String(response.Result);

        throw new Error('UNSUPPORTED');

    },
    async getContract({ hash }) {
        // const client = getClient();
        // const response = await client.getContractJson(hash);
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },
    async getSmartCodeEvent({ value }) {
        // const client = getClient();
        // const response = await client.getSmartCodeEvent(value);
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },
    async getBlockHeightByTxHash({ hash }) {
        // const client = getClient();
        // const response = await client.getBlockHeightByTxHash(hash);
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },

    async getBlockHash({ height }) {
        // const client = getClient();
        // const response = await client.getBlockHash(height);
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },
    async getBlockTxsByHeight({ height }) {
        // const client = getClient();
        // const response = await client.getBlockTxsByHeight(height);
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },
    async getGasPrice() {
        // const client = getClient();
        // const response = await client.getGasPrice();
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },
    async getGrantOng({ address }) {
        // const client = getClient();
        // const response = await client.getGrantOng(new Address(address));
        // return String(response.Result);

        throw new Error('UNSUPPORTED');

    },
    async getMempoolTxCount() {
        // const client = getClient();
        // const response = await client.getMempoolTxCount();
        // return response.Result;
        throw new Error('UNSUPPORTED');

    },
    async getMempoolTxState({ hash }) {
        // const client = getClient();
        // const response = await client.getMempoolTxState(hash);
        // return response.Result;

        throw new Error('UNSUPPORTED');

    },
    async getVersion() {
        // const client = getClient();
        // const response = await client.getVersion();
        // return response.Result;
        throw new Error('UNSUPPORTED');

    }
}
