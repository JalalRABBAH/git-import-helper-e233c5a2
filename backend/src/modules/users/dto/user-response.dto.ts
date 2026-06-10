import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiProperty() phone?: string;
  @ApiProperty() locale!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() lastLoginAt?: Date;
  @ApiProperty() createdAt!: Date;
}
