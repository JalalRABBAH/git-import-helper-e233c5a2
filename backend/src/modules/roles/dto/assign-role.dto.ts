import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: 'ID utilisateur' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'ID rôle' })
  @IsUUID()
  roleId!: string;

  @ApiPropertyOptional({ description: 'ID acteur' })
  @IsOptional()
  @IsUUID()
  actorId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
