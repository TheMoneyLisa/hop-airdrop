"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merkle_1 = require("./merkle");
const core_1 = require("@nestjs/core");
async function start() {
    const app = await core_1.NestFactory.create(AppModule);
    await app.listen(3000);
    const tree = await merkle_1.ShardedMerkleTree.fetchTree();
    console.log(tree);
    const result = await tree.getProof('0x83A524af3cf8eB146132A2459664f7680A5515bE'.toLowerCase());
    console.log(result);
}
start();
