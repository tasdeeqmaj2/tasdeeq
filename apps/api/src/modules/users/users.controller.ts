import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'super_admin')
  list() {
    return this.usersService.list();
  }

  @Post()
  @Roles('admin', 'super_admin')
  create(@Body() dto: CreateUserDto, @Req() req: Record<string, any>) {
    const callerRole = (req as any).sessionUser?.role as string;
    return this.usersService.create(dto, callerRole);
  }

  @Delete(':id')
  @Roles('super_admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
