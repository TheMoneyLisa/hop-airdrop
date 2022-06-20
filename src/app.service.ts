import {Injectable} from "@nestjs/common";
import {ShardedMerkleTree} from "./merkle";

@Injectable()
export class AppService {
    private tree: ShardedMerkleTree;

    constructor() {
        this.startup();
    }

    async startup() {
        this.tree = await ShardedMerkleTree.fetchTree();
    }

    async getInformation(address: string) {
        return await this.tree.getProof(address.toLowerCase())
    }
}