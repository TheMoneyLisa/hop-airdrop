import {AppService} from "./app.service";
import {AppController} from "./app.controller";
import {Module} from "@nestjs/common";
import {HealthController} from "./health.controller";

@Module({
    imports: [],
    controllers: [AppController, HealthController],
    providers: [AppService],
})
export class AppModule {
}
