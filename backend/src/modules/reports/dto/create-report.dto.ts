import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, IsEnum, IsOptional } from 'class-validator';
import { ReportPeriod } from '@shared/enums/report.enum';

export class GenerateReportDto {
  @ApiProperty() @IsUUID() actorId!: string;
  @ApiProperty() @IsInt() year!: number;
  @ApiProperty({ enum: ReportPeriod }) @IsEnum(ReportPeriod) period!: ReportPeriod;
}

export class SubmitReportDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() reviewedBy?: string;
  @ApiPropertyOptional() @IsOptional() notes?: string;
}
