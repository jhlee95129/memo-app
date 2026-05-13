import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMemoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}
