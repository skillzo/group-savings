import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ParksService } from './parks.service';
import { AddPackMemberDto, CreateParkDto } from './dto/create-park.dto';
import { UpdateParkDto } from './dto/update-park.dto';

@Controller('packs')
export class ParksController {
  constructor(private readonly parksService: ParksService) {}

  @Post()
  createPack(@Body() createParkDto: CreateParkDto) {
    return this.parksService.createPack(createParkDto);
  }

  @Get()
  getAllPacks() {
    return this.parksService.getAllPacks();
  }

  @Get('user/:id')
  getUserPacks(@Param('id') id: string) {
    return this.parksService.getUserPacks(id);
  }

  @Get('created-by/:id')
  getPackCreatedByUser(@Param('id') id: string) {
    return this.parksService.getPackCreatedByUser(id);
  }

  @Get(':id')
  getPackById(@Param('id') id: string) {
    return this.parksService.getPackById(id);
  }

  @Post(':id/members')
  addPackMember(
    @Param('id') id: string,
    @Body() addPackMemberDto: AddPackMemberDto,
  ) {
    return this.parksService.addPackMember(id, addPackMemberDto?.email);
  }

  @Get(':id/members')
  getPackMembers(@Param('id') id: string) {
    return this.parksService.getPackMembers(id);
  }

  @Patch(':id/members/:userId')
  removePackMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.parksService.removePackMember(id, userId);
  }

  @Patch(':id')
  updatePack(@Param('id') id: string, @Body() updateParkDto: UpdateParkDto) {
    return this.parksService.updatePack(id, updateParkDto);
  }
}
