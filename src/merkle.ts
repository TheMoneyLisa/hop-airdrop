import {BigNumber, utils} from 'ethers'
import {MerkleTree} from 'merkletreejs'
import keccak256 from 'keccak256'
import fetch from 'cross-fetch';

const merkleBaseUrl = 'https://raw.githubusercontent.com/hop-protocol/governance/master/airdrops/mainnet' // mainnet

// @ts-ignore
function hashLeaf([address, entry]) {
    return utils.solidityKeccak256(['address', 'uint256'], [address, entry.balance])
}

export function getEntryProofIndex(address: string, entry: any, proof: any) {
    let index = 0
    // @ts-ignore
    let computedHash = hashLeaf([address, entry])

    for (let i = 0; i < proof.length; i++) {
        index *= 2
        const proofElement = proof[i]

        if (computedHash <= proofElement) {
            // Hash(current computed hash + current element of the proof)
            computedHash = utils.solidityKeccak256(['bytes32', 'bytes32'], [computedHash, proofElement])
        } else {
            // Hash(current element of the proof + current computed hash)
            computedHash = utils.solidityKeccak256(['bytes32', 'bytes32'], [proofElement, computedHash])
            index += 1
        }
    }
    return index
}

class ShardedMerkleTree {
    fetcher: any
    shardNybbles: any
    root: any
    total: any
    shards: any
    trees: any

    constructor(fetcher: any, shardNybbles: any, root: any, total: any) {
        this.fetcher = fetcher
        this.shardNybbles = shardNybbles
        this.root = root
        this.total = total
        this.shards = {}
        this.trees = {}
    }

    async getProof(address: string) {
        const shardid: string = address.slice(2, 2 + this.shardNybbles).toLowerCase()

        let shard = this.shards[shardid]

        if (shard === undefined) {
            shard = this.shards[shardid] = await this.fetcher(shardid)
            this.trees[shardid] = new MerkleTree(Object.entries(shard.entries).map(hashLeaf), keccak256, {
                sort: true,
            })
        }

        const entry = shard.entries[address]
        if (!entry) {
            throw new Error('Invalid Entry')
        }

        const leaf = hashLeaf([address, entry])

        const proof = this.trees[shardid].getProof(leaf).map((entry: any) => '0x' + entry.data.toString('hex'))

        return [entry, proof.concat(shard.proof)]
    }

    static async fetchRootFile() {
        const url = `${merkleBaseUrl}/root.json`
        const res = await fetch(url)
        const rootFile = await res.json()
        // @ts-ignore
        if (!rootFile.root) {
            throw new Error('Invalid root file')
        }
        // @ts-ignore
        const {root, shardNybbles, total} = rootFile
        return {
            root,
            shardNybbles,
            total
        }
    }

    static async fetchTree() {
        const {root, shardNybbles, total} = await ShardedMerkleTree.fetchRootFile()
        return new ShardedMerkleTree(
            async (shard: any) => {
                const url = `${merkleBaseUrl}/${shard}.json`
                const res = await fetch(url)
                if (res.status === 404) {
                    throw new Error('Invalid Entry')
                }
                return res.json()
            },
            shardNybbles,
            root,
            BigNumber.from(total)
        )
    }
}

export {ShardedMerkleTree}