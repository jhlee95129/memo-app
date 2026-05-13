import { IsOptional, IsString } from 'class-validator';

export class SearchMemoDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
