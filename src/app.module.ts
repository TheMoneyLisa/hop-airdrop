import {AppService} from "./app.service";
import {AppController} from "./app.controller";
import {Module} from "@nestjs/common";

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
