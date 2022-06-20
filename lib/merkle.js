"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShardedMerkleTree = exports.getEntryProofIndex = void 0;
const ethers_1 = require("ethers");
const merkletreejs_1 = require("merkletreejs");
const keccak256_1 = __importDefault(require("keccak256"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const merkleBaseUrl = 'https://raw.githubusercontent.com/hop-protocol/governance/master/airdrops/mainnet'; // mainnet
// @ts-ignore
function hashLeaf([address, entry]) {
    return ethers_1.utils.solidityKeccak256(['address', 'uint256'], [address, entry.balance]);
}
function getEntryProofIndex(address, entry, proof) {
    let index = 0;
    // @ts-ignore
    let computedHash = hashLeaf([address, entry]);
    for (let i = 0; i < proof.length; i++) {
        index *= 2;
        const proofElement = proof[i];
        if (computedHash <= proofElement) {
            // Hash(current computed hash + current element of the proof)
            computedHash = ethers_1.utils.solidityKeccak256(['bytes32', 'bytes32'], [computedHash, proofElement]);
        }
        else {
            // Hash(current element of the proof + current computed hash)
            computedHash = ethers_1.utils.solidityKeccak256(['bytes32', 'bytes32'], [proofElement, computedHash]);
            index += 1;
        }
    }
    return index;
}
exports.getEntryProofIndex = getEntryProofIndex;
class ShardedMerkleTree {
    fetcher;
    shardNybbles;
    root;
    total;
    shards;
    trees;
    constructor(fetcher, shardNybbles, root, total) {
        this.fetcher = fetcher;
        this.shardNybbles = shardNybbles;
        this.root = root;
        this.total = total;
        this.shards = {};
        this.trees = {};
    }
    async getProof(address) {
        const shardid = address.slice(2, 2 + this.shardNybbles).toLowerCase();
        let shard = this.shards[shardid];
        if (shard === undefined) {
            shard = this.shards[shardid] = await this.fetcher(shardid);
            this.trees[shardid] = new merkletreejs_1.MerkleTree(Object.entries(shard.entries).map(hashLeaf), keccak256_1.default, {
                sort: true,
            });
        }
        console.log(address);
        console.log(shard);
        const entry = shard.entries[address];
        if (!entry) {
            throw new Error('Invalid Entry');
        }
        const leaf = hashLeaf([address, entry]);
        const proof = this.trees[shardid].getProof(leaf).map((entry) => '0x' + entry.data.toString('hex'));
        return [entry, proof.concat(shard.proof)];
    }
    static async fetchRootFile() {
        const url = `${merkleBaseUrl}/root.json`;
        const res = await (0, cross_fetch_1.default)(url);
        const rootFile = await res.json();
        // @ts-ignore
        if (!rootFile.root) {
            throw new Error('Invalid root file');
        }
        // @ts-ignore
        const { root, shardNybbles, total } = rootFile;
        return {
            root,
            shardNybbles,
            total
        };
    }
    static async fetchTree() {
        const { root, shardNybbles, total } = await ShardedMerkleTree.fetchRootFile();
        return new ShardedMerkleTree(async (shard) => {
            const url = `${merkleBaseUrl}/${shard}.json`;
            const res = await (0, cross_fetch_1.default)(url);
            if (res.status === 404) {
                throw new Error('Invalid Entry');
            }
            return res.json();
        }, shardNybbles, root, ethers_1.BigNumber.from(total));
    }
}
exports.ShardedMerkleTree = ShardedMerkleTree;
