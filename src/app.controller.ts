import {Controller, Get, Param} from "@nestjs/common";
import {AppService} from "./app.service";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get(':address')
    async getInformation(@Param('address') address: string): Promise<any> {
        try {
            return await this.appService.getInformation(address);
        } catch (ex) {
            return [];
        }
    }
}