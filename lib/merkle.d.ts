export declare function getEntryProofIndex(address: string, entry: any, proof: any): number;
declare class ShardedMerkleTree {
    fetcher: any;
    shardNybbles: any;
    root: any;
    total: any;
    shards: any;
    trees: any;
    constructor(fetcher: any, shardNybbles: any, root: any, total: any);
    getProof(address: string): Promise<any[]>;
    static fetchRootFile(): Promise<{
        root: any;
        shardNybbles: any;
        total: any;
    }>;
    static fetchTree(): Promise<ShardedMerkleTree>;
}
export { ShardedMerkleTree };
