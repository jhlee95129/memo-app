import { IsString, MinLength } from 'class-validator';

export class CreateMemoDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  content!: string;
}
