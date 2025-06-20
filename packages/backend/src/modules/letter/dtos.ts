import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PostLetterDto {
  @ApiProperty({
    description: 'The handle of the receiver',
    example: 'test',
  })
  @IsString()
  @IsNotEmpty()
  receiverHandle: string;

  @ApiPropertyOptional({
    description: 'The title of the letter',
    example: 'Hello, world!',
  })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({
    description: 'The content of the letter',
    example: 'Hello, world!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
