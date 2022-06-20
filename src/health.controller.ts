import {Controller, Get, Param} from "@nestjs/common";
import {AppService} from "./app.service";

@Controller('health')
export class HealthController {

    @Get()
    async getInformation(): Promise<any> {
        return {status: 'AMAZING'}
    }
}