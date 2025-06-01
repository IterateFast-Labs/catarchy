import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { user } from 'prisma/db';
import { User } from 'src/commons/decorators/user.decorator';
import { AuthGuard } from 'src/commons/guards/auth.guard';
import { PostLetterDto } from './dtos';
import { LetterService } from './letter.service';

@ApiTags('Letter')
@Controller('letters')
@UseGuards(AuthGuard)
@ApiBearerAuth('token')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  @Post('')
  public async sendLetter(@User() user: user, @Body() body: PostLetterDto) {
    return this.letterService.sendLetter(
      user.id,
      body.receiverHandle,
      body.content,
      body.title,
    );
  }

  @Get('unread-count')
  public async getUnreadLetterCount(@User() user: user) {
    return this.letterService.getUnreadLetterCount(user.id);
  }

  @Get('received')
  public async getReceivedLetters(
    @User() user: user,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    return this.letterService.getReceivedLetters(
      user.id,
      Number(page),
      Number(size),
    );
  }

  @Get('sent')
  public async getSentLetters(
    @User() user: user,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    return this.letterService.getSentLetters(
      user.id,
      Number(page),
      Number(size),
    );
  }

  @Get(':letterId')
  public async getLetter(
    @User() user: user,
    @Param('letterId') letterId: string,
  ) {
    return this.letterService.getLetter(letterId, user.id);
  }

  @Delete(':letterId')
  public async deleteLetter(
    @User() user: user,
    @Param('letterId') letterId: string,
  ) {
    return this.letterService.deleteLetter(letterId, user.id);
  }
}
