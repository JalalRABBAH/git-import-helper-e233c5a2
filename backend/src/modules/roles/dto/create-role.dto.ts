import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'CONTROLEUR' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Contrôleur DRCTT' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  hierarchyLevel?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSystemRole?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'IDs des permissions' })
  @IsOptional()
  @IsArray()
  permissionIds?: string[];
}
